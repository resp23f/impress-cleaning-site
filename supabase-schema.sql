-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Create enum types
CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended');
CREATE TYPE communication_preference AS ENUM ('text', 'email', 'both');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE service_type AS ENUM ('standard', 'deep', 'move_in_out', 'post_construction', 'office');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('stripe', 'zelle', 'cash', 'check');
CREATE TYPE request_status AS ENUM ('pending', 'approved', 'declined', 'completed');
-- ========================================
-- PROFILES TABLE
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  account_status account_status DEFAULT 'pending' NOT NULL,
  communication_preference communication_preference DEFAULT 'both',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- SERVICE ADDRESSES TABLE
-- ========================================
CREATE TABLE service_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  street_address TEXT NOT NULL,
  unit TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  place_id TEXT, -- Google Places ID
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- APPOINTMENTS TABLE
-- ========================================
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  address_id UUID REFERENCES service_addresses(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_start TIME NOT NULL,
  scheduled_time_end TIME NOT NULL,
  status appointment_status DEFAULT 'pending' NOT NULL,
  team_members TEXT[], -- Array of team member names
  special_instructions TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT, -- 'weekly', 'bi-weekly', 'monthly'
  parent_recurring_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- SERVICE HISTORY TABLE
-- ========================================
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_type service_type NOT NULL,
  completed_date DATE NOT NULL,
  team_members TEXT[],
  photos TEXT[], -- Array of photo URLs
  notes TEXT,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
  customer_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- INVOICES TABLE
-- ========================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status invoice_status DEFAULT 'draft' NOT NULL,
  due_date DATE,
  paid_date DATE,
  payment_method payment_method,
  stripe_payment_intent_id TEXT,
  notes TEXT,
  line_items JSONB, -- Array of {description, quantity, rate, amount}
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- SERVICE REQUESTS TABLE
-- ========================================
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  service_type service_type NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  is_flexible BOOLEAN DEFAULT false,
  address_id UUID REFERENCES service_addresses(id) ON DELETE SET NULL,
  special_requests TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  status request_status DEFAULT 'pending' NOT NULL,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- PAYMENT METHODS TABLE (Stripe)
-- ========================================
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- ADMIN NOTIFICATIONS TABLE
-- ========================================
CREATE TABLE admin_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL, -- 'new_registration', 'service_request', etc.
  title TEXT NOT NULL,
  message TEXT,
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- RATE LIMITING TABLE
-- ========================================
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL, -- 'signup', 'login', etc.
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
-- ========================================
-- INDEXES
-- ========================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(account_status);
CREATE INDEX idx_service_addresses_user ON service_addresses(user_id);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_date ON appointments(scheduled_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_service_history_customer ON service_history(customer_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX idx_rate_limits_ip_action ON rate_limits(ip_address, action);
-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- SERVICE ADDRESSES POLICIES
CREATE POLICY "Users can view own addresses"
  ON service_addresses FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own addresses"
  ON service_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own addresses"
  ON service_addresses FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own addresses"
  ON service_addresses FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all addresses"
  ON service_addresses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- APPOINTMENTS POLICIES
CREATE POLICY "Customers can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can insert appointments"
  ON appointments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Customers can update own appointments status"
  ON appointments FOR UPDATE
  USING (
    auth.uid() = customer_id AND
    status IN ('pending', 'confirmed')
  );
-- SERVICE HISTORY POLICIES
CREATE POLICY "Customers can view own service history"
  ON service_history FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all service history"
  ON service_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can insert service history"
  ON service_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- INVOICES POLICIES
CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Admins can view all invoices"
  ON invoices FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can manage invoices"
  ON invoices FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- SERVICE REQUESTS POLICIES
CREATE POLICY "Customers can view own requests"
  ON service_requests FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "Customers can insert own requests"
  ON service_requests FOR INSERT
  WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Admins can view all requests"
  ON service_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update requests"
  ON service_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- PAYMENT METHODS POLICIES
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);
-- ADMIN NOTIFICATIONS POLICIES
CREATE POLICY "Admins can view notifications"
  ON admin_notifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
CREATE POLICY "Admins can update notifications"
  ON admin_notifications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
-- ========================================
-- FUNCTIONS
-- ========================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_addresses_updated_at BEFORE UPDATE ON service_addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON service_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  invoice_num TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 5) AS INTEGER)), 0) + 1
  INTO next_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-%';
  invoice_num := 'INV-' || LPAD(next_number::TEXT, 6, '0');
  RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;
-- Function to send admin notification
CREATE OR REPLACE FUNCTION send_admin_notification(
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT DEFAULT NULL,
  notification_link TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO admin_notifications (type, title, message, link)
  VALUES (notification_type, notification_title, notification_message, notification_link)
  RETURNING id INTO notification_id;
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;
-- Trigger to notify admin on new registration
CREATE OR REPLACE FUNCTION notify_admin_new_registration()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_new_customer_registration
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_admin_new_registration();
-- Trigger to notify admin on new service request
CREATE OR REPLACE FUNCTION notify_admin_service_request()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_new_service_request
  AFTER INSERT ON service_requests
  FOR EACH ROW EXECUTE FUNCTION notify_admin_service_request();