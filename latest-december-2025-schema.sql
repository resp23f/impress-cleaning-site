


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."account_status" AS ENUM (
    'pending',
    'active',
    'suspended'
);


ALTER TYPE "public"."account_status" OWNER TO "postgres";


CREATE TYPE "public"."appointment_status" AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'not_completed',
    'en_route'
);


ALTER TYPE "public"."appointment_status" OWNER TO "postgres";


CREATE TYPE "public"."communication_preference" AS ENUM (
    'text',
    'email',
    'both'
);


ALTER TYPE "public"."communication_preference" OWNER TO "postgres";


CREATE TYPE "public"."invoice_status" AS ENUM (
    'draft',
    'sent',
    'paid',
    'overdue',
    'cancelled'
);


ALTER TYPE "public"."invoice_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'stripe',
    'zelle',
    'cash',
    'check'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."request_status" AS ENUM (
    'pending',
    'approved',
    'declined',
    'completed'
);


ALTER TYPE "public"."request_status" OWNER TO "postgres";


CREATE TYPE "public"."service_type" AS ENUM (
    'standard',
    'deep',
    'move_in_out',
    'post_construction',
    'office'
);


ALTER TYPE "public"."service_type" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'customer',
    'admin'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."auto_complete_appointments"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  -- 1) Insert into service_history for newly completed appointments
  insert into public.service_history (
    appointment_id,
    customer_id,
    service_type,
    completed_date,
    team_members
  )
  select
    a.id,
    a.customer_id,
    a.service_type,
    (now() at time zone 'utc')::date,
    coalesce(a.team_members, '{}'::text[])
  from public.appointments a
  where a.status in ('confirmed', 'en_route')
    and a.completed_at is null
    and a.cancelled_at is null
    and (a.scheduled_date + a.scheduled_time_end) <= (now() at time zone 'utc')
    and not exists (
      select 1
      from public.service_history sh
      where sh.appointment_id = a.id
    );

  -- 2) Mark those same appointments as completed
  update public.appointments a
  set status = 'completed',
      completed_at = now()
  where a.status in ('confirmed', 'en_route')
    and a.completed_at is null
    and a.cancelled_at is null
    and (a.scheduled_date + a.scheduled_time_end) <= (now() at time zone 'utc');
end;
$$;


ALTER FUNCTION "public"."auto_complete_appointments"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_invoice_number"() RETURNS "text"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  year_month TEXT;
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  -- Get current year and month as YYMM (e.g., 2412 for Dec 2024)
  year_month := TO_CHAR(NOW(), 'YYMM');
  
  -- Get next sequence number for this month, starting at 1001
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(invoice_number, '-', 3) AS INTEGER)
  ), 1000) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'IMP-' || year_month || '-%';

  invoice_num := 'IMP-' || year_month || '-' || next_number::TEXT;
  RETURN invoice_num;
END;
$$;


ALTER FUNCTION "public"."generate_invoice_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_status, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer',
    'active',
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION "public"."is_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."link_orphan_invoices"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  linked_count INTEGER;
BEGIN
  -- Link any invoices with matching email to this new user
  UPDATE invoices
  SET customer_id = NEW.id,
      updated_at = NOW()
  WHERE LOWER(customer_email) = LOWER(NEW.email)
    AND customer_id IS NULL;
  
  GET DIAGNOSTICS linked_count = ROW_COUNT;
  
  IF linked_count > 0 THEN
    RAISE LOG 'Linked % orphan invoice(s) to new user %', linked_count, NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."link_orphan_invoices"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."mark_overdue_invoices"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  update public.invoices
  set status = 'overdue'
  where status in ('sent', 'pending')
    and due_date < (now() - interval '7 days');
end;
$$;


ALTER FUNCTION "public"."mark_overdue_invoices"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_new_registration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  IF NEW.account_status = 'pending' AND NEW.role = 'customer' THEN
    PERFORM send_admin_notification(
      'new_registration',
      'New Customer Registration',
      'A new customer has registered: ' || NEW.full_name,
      '/admin/registrations/' || NEW.id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_admin_new_registration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_admin_service_request"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  customer_name TEXT;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT full_name INTO customer_name
    FROM profiles
    WHERE id = NEW.customer_id;

    PERFORM send_admin_notification(
      'service_request',
      'New Service Request',
      customer_name || ' has requested a ' || NEW.service_type || ' service',
      '/admin/requests/' || NEW.id::TEXT
    );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_admin_service_request"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."prevent_role_self_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role 
     AND OLD.id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."prevent_role_self_change"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."send_admin_notification"("notification_type" "text", "notification_title" "text", "notification_message" "text" DEFAULT NULL::"text", "notification_link" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO admin_notifications (type, title, message, link)
  VALUES (notification_type, notification_title, notification_message, notification_link)
  RETURNING id INTO notification_id;

  RETURN notification_id;
END;
$$;


ALTER FUNCTION "public"."send_admin_notification"("notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_link" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_customer_notifications_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_customer_notifications_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public', 'pg_temp'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_notifications" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "link" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."admin_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_settings" (
    "id" integer DEFAULT 1 NOT NULL,
    "business_name" "text" DEFAULT 'Impress Cleaning Services'::"text",
    "business_email" "text" DEFAULT 'support@impresscleaning.com'::"text",
    "business_phone" "text" DEFAULT '(512) 277-5364'::"text",
    "business_address" "text" DEFAULT '123 Main St, Fort Worth, TX 76104'::"text",
    "business_website" "text" DEFAULT 'https://impressyoucleaning.com'::"text",
    "price_standard" integer DEFAULT 150,
    "price_deep" integer DEFAULT 250,
    "price_move_in_out" integer DEFAULT 350,
    "price_post_construction" integer DEFAULT 450,
    "price_office" integer DEFAULT 200,
    "business_hours" "jsonb" DEFAULT '{"friday": {"open": "08:00", "close": "18:00", "closed": false}, "monday": {"open": "08:00", "close": "18:00", "closed": false}, "sunday": {"open": "09:00", "close": "15:00", "closed": true}, "tuesday": {"open": "08:00", "close": "18:00", "closed": false}, "saturday": {"open": "09:00", "close": "15:00", "closed": false}, "thursday": {"open": "08:00", "close": "18:00", "closed": false}, "wednesday": {"open": "08:00", "close": "18:00", "closed": false}}'::"jsonb",
    "notifications" "jsonb" DEFAULT '{"invoiceOverdue": true, "serviceRequest": true, "newRegistration": true, "paymentReceived": true, "appointmentCancelled": true}'::"jsonb",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "admin_settings_id_check" CHECK (("id" = 1))
);


ALTER TABLE "public"."admin_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."appointments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "address_id" "uuid",
    "service_type" "public"."service_type" NOT NULL,
    "scheduled_date" "date" NOT NULL,
    "scheduled_time_start" time without time zone NOT NULL,
    "scheduled_time_end" time without time zone NOT NULL,
    "status" "public"."appointment_status" DEFAULT 'pending'::"public"."appointment_status" NOT NULL,
    "team_members" "text"[],
    "special_instructions" "text",
    "is_recurring" boolean DEFAULT false,
    "recurring_frequency" "text",
    "parent_recurring_id" "uuid",
    "completed_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "cancellation_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."appointments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."booking_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "address" "text",
    "service_type" "text",
    "service_level" "text",
    "space_size" "text",
    "preferred_date" "text",
    "preferred_time" "text",
    "gift_certificate" "text",
    "special_requests" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."booking_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "link" "text",
    "reference_id" "uuid",
    "reference_type" "text",
    "is_read" boolean DEFAULT false,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."customer_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."customer_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "rating" integer NOT NULL,
    "review_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "customer_reviews_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."customer_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "invoice_number" "text" NOT NULL,
    "customer_id" "uuid",
    "appointment_id" "uuid",
    "amount" numeric(10,2) NOT NULL,
    "status" "public"."invoice_status" DEFAULT 'draft'::"public"."invoice_status" NOT NULL,
    "due_date" "date",
    "paid_date" "date",
    "payment_method" "public"."payment_method",
    "stripe_payment_intent_id" "text",
    "notes" "text",
    "line_items" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tax_rate" numeric,
    "tax_amount" numeric,
    "total" numeric,
    "archived" boolean DEFAULT false,
    "customer_email" "text",
    "stripe_invoice_id" "text"
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stripe_payment_method_id" "text" NOT NULL,
    "card_brand" "text",
    "card_last4" "text",
    "card_exp_month" integer,
    "card_exp_year" integer,
    "is_default" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "phone" "text",
    "role" "public"."user_role" NOT NULL,
    "account_status" "public"."account_status" NOT NULL,
    "communication_preference" "public"."communication_preference" DEFAULT 'both'::"public"."communication_preference",
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ip_address" "text" NOT NULL,
    "action" "text" NOT NULL,
    "attempts" integer DEFAULT 1,
    "window_start" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_addresses" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "street_address" "text" NOT NULL,
    "unit" "text",
    "city" "text" NOT NULL,
    "state" "text" NOT NULL,
    "zip_code" "text" NOT NULL,
    "place_id" "text",
    "is_primary" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_addresses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_history" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "appointment_id" "uuid" NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "service_type" "public"."service_type" NOT NULL,
    "completed_date" "date" NOT NULL,
    "team_members" "text"[],
    "photos" "text"[],
    "notes" "text",
    "customer_rating" integer,
    "customer_feedback" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "service_history_customer_rating_check" CHECK ((("customer_rating" >= 1) AND ("customer_rating" <= 5)))
);


ALTER TABLE "public"."service_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."service_requests" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "customer_id" "uuid" NOT NULL,
    "service_type" "public"."service_type" NOT NULL,
    "preferred_date" "date",
    "preferred_time" "text",
    "is_flexible" boolean DEFAULT false,
    "address_id" "uuid",
    "special_requests" "text",
    "is_recurring" boolean DEFAULT false,
    "recurring_frequency" "text",
    "status" "public"."request_status" DEFAULT 'pending'::"public"."request_status" NOT NULL,
    "admin_notes" "text",
    "reviewed_by" "uuid",
    "reviewed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."service_requests" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_notifications"
    ADD CONSTRAINT "admin_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_settings"
    ADD CONSTRAINT "admin_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."booking_requests"
    ADD CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_notifications"
    ADD CONSTRAINT "customer_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."customer_reviews"
    ADD CONSTRAINT "customer_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_invoice_number_key" UNIQUE ("invoice_number");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_stripe_invoice_id_key" UNIQUE ("stripe_invoice_id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_stripe_payment_method_id_key" UNIQUE ("stripe_payment_method_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_addresses"
    ADD CONSTRAINT "service_addresses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_history"
    ADD CONSTRAINT "service_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_appointments_address" ON "public"."appointments" USING "btree" ("address_id");



CREATE INDEX "idx_appointments_customer" ON "public"."appointments" USING "btree" ("customer_id");



CREATE INDEX "idx_appointments_date" ON "public"."appointments" USING "btree" ("scheduled_date");



CREATE INDEX "idx_appointments_parent_recurring" ON "public"."appointments" USING "btree" ("parent_recurring_id");



CREATE INDEX "idx_appointments_status" ON "public"."appointments" USING "btree" ("status");



CREATE INDEX "idx_booking_requests_created" ON "public"."booking_requests" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_booking_requests_id" ON "public"."booking_requests" USING "btree" ("id");



CREATE INDEX "idx_customer_notifications_created_at" ON "public"."customer_notifications" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_customer_notifications_is_read" ON "public"."customer_notifications" USING "btree" ("is_read");



CREATE INDEX "idx_customer_notifications_user_id" ON "public"."customer_notifications" USING "btree" ("user_id");



CREATE INDEX "idx_customer_reviews_created" ON "public"."customer_reviews" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_customer_reviews_customer" ON "public"."customer_reviews" USING "btree" ("customer_id");



CREATE INDEX "idx_invoices_appointment" ON "public"."invoices" USING "btree" ("appointment_id");



CREATE INDEX "idx_invoices_customer" ON "public"."invoices" USING "btree" ("customer_id");



CREATE INDEX "idx_invoices_customer_email" ON "public"."invoices" USING "btree" ("customer_email");



CREATE INDEX "idx_invoices_number" ON "public"."invoices" USING "btree" ("invoice_number");



CREATE INDEX "idx_invoices_status" ON "public"."invoices" USING "btree" ("status");



CREATE INDEX "idx_payment_methods_user" ON "public"."payment_methods" USING "btree" ("user_id");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_profiles_role" ON "public"."profiles" USING "btree" ("role");



CREATE INDEX "idx_profiles_status" ON "public"."profiles" USING "btree" ("account_status");



CREATE INDEX "idx_rate_limits_ip_action" ON "public"."rate_limits" USING "btree" ("ip_address", "action");



CREATE INDEX "idx_service_addresses_user" ON "public"."service_addresses" USING "btree" ("user_id");



CREATE INDEX "idx_service_history_appointment" ON "public"."service_history" USING "btree" ("appointment_id");



CREATE INDEX "idx_service_history_customer" ON "public"."service_history" USING "btree" ("customer_id");



CREATE INDEX "idx_service_requests_address" ON "public"."service_requests" USING "btree" ("address_id");



CREATE INDEX "idx_service_requests_customer" ON "public"."service_requests" USING "btree" ("customer_id");



CREATE INDEX "idx_service_requests_reviewed_by" ON "public"."service_requests" USING "btree" ("reviewed_by");



CREATE INDEX "idx_service_requests_status" ON "public"."service_requests" USING "btree" ("status");



CREATE OR REPLACE TRIGGER "prevent_role_change_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_self_change"();



CREATE OR REPLACE TRIGGER "prevent_role_self_change_trigger" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_role_self_change"();



CREATE OR REPLACE TRIGGER "trigger_link_orphan_invoices" AFTER INSERT ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."link_orphan_invoices"();



CREATE OR REPLACE TRIGGER "update_appointments_updated_at" BEFORE UPDATE ON "public"."appointments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_customer_notifications_updated_at" BEFORE UPDATE ON "public"."customer_notifications" FOR EACH ROW EXECUTE FUNCTION "public"."update_customer_notifications_updated_at"();



CREATE OR REPLACE TRIGGER "update_invoices_updated_at" BEFORE UPDATE ON "public"."invoices" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_addresses_updated_at" BEFORE UPDATE ON "public"."service_addresses" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_service_requests_updated_at" BEFORE UPDATE ON "public"."service_requests" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."service_addresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."appointments"
    ADD CONSTRAINT "appointments_parent_recurring_id_fkey" FOREIGN KEY ("parent_recurring_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."customer_notifications"
    ADD CONSTRAINT "customer_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."customer_reviews"
    ADD CONSTRAINT "customer_reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_addresses"
    ADD CONSTRAINT "service_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_history"
    ADD CONSTRAINT "service_history_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_history"
    ADD CONSTRAINT "service_history_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."service_addresses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."service_requests"
    ADD CONSTRAINT "service_requests_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can delete bookings" ON "public"."booking_requests" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can delete invoices" ON "public"."invoices" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert appointments" ON "public"."appointments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert invoices" ON "public"."invoices" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can insert service history" ON "public"."service_history" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can read settings" ON "public"."admin_settings" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update bookings" ON "public"."booking_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update invoices" ON "public"."invoices" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update notifications" ON "public"."admin_notifications" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update requests" ON "public"."service_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can update settings" ON "public"."admin_settings" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view bookings" ON "public"."booking_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view notifications" ON "public"."admin_notifications" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Admins can view reviews" ON "public"."customer_reviews" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))));



CREATE POLICY "Allow rate limit delete" ON "public"."rate_limits" FOR DELETE TO "service_role" USING (true);



CREATE POLICY "Allow rate limit insert" ON "public"."rate_limits" FOR INSERT TO "authenticated", "anon", "service_role" WITH CHECK (true);



CREATE POLICY "Allow rate limit select" ON "public"."rate_limits" FOR SELECT TO "authenticated", "anon", "service_role" USING (true);



CREATE POLICY "Allow rate limit update" ON "public"."rate_limits" FOR UPDATE TO "authenticated", "anon", "service_role" USING (true);



CREATE POLICY "Anyone can insert booking requests" ON "public"."booking_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Appointments Update" ON "public"."appointments" FOR UPDATE USING (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))))) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "customer_id") OR (EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role"))))));



CREATE POLICY "Appointments select" ON "public"."appointments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))) OR ("customer_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Customers can insert own requests" ON "public"."service_requests" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Customers can submit reviews" ON "public"."customer_reviews" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "customer_id"));



CREATE POLICY "Invoices select" ON "public"."invoices" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = "auth"."uid"()) AND ("profiles"."role" = 'admin'::"public"."user_role")))) OR ("customer_id" = "auth"."uid"()) OR (("customer_id" IS NULL) AND ("customer_email" IS NOT NULL) AND ("lower"("customer_email") = "lower"(( SELECT "profiles"."email"
   FROM "public"."profiles"
  WHERE ("profiles"."id" = "auth"."uid"())))))));



CREATE POLICY "Service addresses select" ON "public"."service_addresses" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))) OR ("user_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Service history select" ON "public"."service_history" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))) OR ("customer_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Service requests select" ON "public"."service_requests" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."profiles"
  WHERE (("profiles"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("profiles"."role" = 'admin'::"public"."user_role")))) OR ("customer_id" = ( SELECT "auth"."uid"() AS "uid"))));



CREATE POLICY "Service role can manage invoices" ON "public"."invoices" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role can read bookings" ON "public"."booking_requests" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Update own or admin updates all" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "id") OR "public"."is_admin"()));



CREATE POLICY "Users can delete own addresses" ON "public"."service_addresses" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can delete own payment methods" ON "public"."payment_methods" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own addresses" ON "public"."service_addresses" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can insert own payment methods" ON "public"."payment_methods" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can update own addresses" ON "public"."service_addresses" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "Users can view own payment methods" ON "public"."payment_methods" FOR SELECT USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "View own or admin views all" ON "public"."profiles" FOR SELECT TO "authenticated" USING (((( SELECT "auth"."uid"() AS "uid") = "id") OR "public"."is_admin"()));



ALTER TABLE "public"."admin_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."appointments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."booking_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."customer_notifications" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "customer_notifications_select_own" ON "public"."customer_notifications" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



CREATE POLICY "customer_notifications_update_own" ON "public"."customer_notifications" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "public"."customer_reviews" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_own" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_addresses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."service_requests" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_complete_appointments"() TO "anon";
GRANT ALL ON FUNCTION "public"."auto_complete_appointments"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_complete_appointments"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_invoice_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."link_orphan_invoices"() TO "anon";
GRANT ALL ON FUNCTION "public"."link_orphan_invoices"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."link_orphan_invoices"() TO "service_role";



GRANT ALL ON FUNCTION "public"."mark_overdue_invoices"() TO "anon";
GRANT ALL ON FUNCTION "public"."mark_overdue_invoices"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."mark_overdue_invoices"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_new_registration"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_new_registration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_new_registration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_admin_service_request"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_admin_service_request"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_admin_service_request"() TO "service_role";



GRANT ALL ON FUNCTION "public"."prevent_role_self_change"() TO "anon";
GRANT ALL ON FUNCTION "public"."prevent_role_self_change"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."prevent_role_self_change"() TO "service_role";



GRANT ALL ON FUNCTION "public"."send_admin_notification"("notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_link" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."send_admin_notification"("notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_link" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."send_admin_notification"("notification_type" "text", "notification_title" "text", "notification_message" "text", "notification_link" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_customer_notifications_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_customer_notifications_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_customer_notifications_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_notifications" TO "anon";
GRANT ALL ON TABLE "public"."admin_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."admin_settings" TO "anon";
GRANT ALL ON TABLE "public"."admin_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_settings" TO "service_role";



GRANT ALL ON TABLE "public"."appointments" TO "anon";
GRANT ALL ON TABLE "public"."appointments" TO "authenticated";
GRANT ALL ON TABLE "public"."appointments" TO "service_role";



GRANT ALL ON TABLE "public"."booking_requests" TO "anon";
GRANT ALL ON TABLE "public"."booking_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."booking_requests" TO "service_role";



GRANT ALL ON TABLE "public"."customer_notifications" TO "anon";
GRANT ALL ON TABLE "public"."customer_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."customer_reviews" TO "anon";
GRANT ALL ON TABLE "public"."customer_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."customer_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."service_addresses" TO "anon";
GRANT ALL ON TABLE "public"."service_addresses" TO "authenticated";
GRANT ALL ON TABLE "public"."service_addresses" TO "service_role";



GRANT ALL ON TABLE "public"."service_history" TO "anon";
GRANT ALL ON TABLE "public"."service_history" TO "authenticated";
GRANT ALL ON TABLE "public"."service_history" TO "service_role";



GRANT ALL ON TABLE "public"."service_requests" TO "anon";
GRANT ALL ON TABLE "public"."service_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."service_requests" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







