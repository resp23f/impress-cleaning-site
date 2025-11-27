/**
 * Diagnostic Script for Customer Notifications
 *
 * This script helps debug why notifications aren't appearing after invoice sends.
 * Run this with: node test-notification-debug.js
 */

import { supabaseAdmin } from './src/lib/supabase/admin.js'

async function runDiagnostics() {
  console.log('🔍 Starting Customer Notification Diagnostics\n')
  console.log('=' .repeat(60))

  // 1. Check environment variables
  console.log('\n1️⃣ CHECKING ENVIRONMENT VARIABLES')
  console.log('-'.repeat(60))
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log(`✓ NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`✓ SUPABASE_SERVICE_ROLE_KEY: ${hasServiceKey ? '✅ Set' : '❌ Missing'}`)

  if (!hasSupabaseUrl || !hasServiceKey) {
    console.error('\n❌ Missing required environment variables. Cannot proceed.')
    process.exit(1)
  }

  // 2. Check if customer_notifications table exists
  console.log('\n2️⃣ CHECKING DATABASE TABLE')
  console.log('-'.repeat(60))
  try {
    const { data: tableCheck, error: tableError } = await supabaseAdmin
      .from('customer_notifications')
      .select('*')
      .limit(1)

    if (tableError) {
      console.error('❌ Table check failed:', tableError.message)
      console.error('   Code:', tableError.code)
      console.error('   Details:', tableError.details)
      console.error('   Hint:', tableError.hint)
    } else {
      console.log('✅ customer_notifications table exists and is accessible')
    }
  } catch (err) {
    console.error('❌ Error checking table:', err.message)
  }

  // 3. Check existing notifications
  console.log('\n3️⃣ CHECKING EXISTING NOTIFICATIONS')
  console.log('-'.repeat(60))
  try {
    const { data: allNotifications, error: fetchError } = await supabaseAdmin
      .from('customer_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (fetchError) {
      console.error('❌ Failed to fetch notifications:', fetchError.message)
    } else {
      console.log(`✅ Found ${allNotifications?.length || 0} notifications (showing last 5)`)
      if (allNotifications && allNotifications.length > 0) {
        allNotifications.forEach((notif, idx) => {
          console.log(`\n   [${idx + 1}] Notification:`)
          console.log(`       ID: ${notif.id}`)
          console.log(`       User ID: ${notif.user_id}`)
          console.log(`       Type: ${notif.type}`)
          console.log(`       Title: ${notif.title}`)
          console.log(`       Created: ${notif.created_at}`)
          console.log(`       Read: ${notif.is_read}`)
        })
      } else {
        console.log('   ⚠️  No notifications found in database')
      }
    }
  } catch (err) {
    console.error('❌ Error fetching notifications:', err.message)
  }

  // 4. Check recent invoices
  console.log('\n4️⃣ CHECKING RECENT INVOICES')
  console.log('-'.repeat(60))
  try {
    const { data: invoices, error: invoiceError } = await supabaseAdmin
      .from('invoices')
      .select(`
        id,
        invoice_number,
        customer_id,
        status,
        created_at,
        profiles!customer_id(id, email, full_name)
      `)
      .order('created_at', { ascending: false })
      .limit(3)

    if (invoiceError) {
      console.error('❌ Failed to fetch invoices:', invoiceError.message)
    } else {
      console.log(`✅ Found ${invoices?.length || 0} recent invoices`)
      if (invoices && invoices.length > 0) {
        invoices.forEach((inv, idx) => {
          console.log(`\n   [${idx + 1}] Invoice:`)
          console.log(`       Invoice #: ${inv.invoice_number}`)
          console.log(`       ID: ${inv.id}`)
          console.log(`       Customer ID: ${inv.customer_id}`)
          console.log(`       Status: ${inv.status}`)
          console.log(`       Customer Email: ${inv.profiles?.email || 'N/A'}`)
          console.log(`       Created: ${inv.created_at}`)
        })
      }
    }
  } catch (err) {
    console.error('❌ Error fetching invoices:', err.message)
  }

  // 5. Test notification creation
  console.log('\n5️⃣ TESTING NOTIFICATION CREATION')
  console.log('-'.repeat(60))
  console.log('ℹ️  Attempting to create a test notification...')

  try {
    // Get a real customer ID from recent invoices
    const { data: invoice } = await supabaseAdmin
      .from('invoices')
      .select('customer_id, invoice_number, profiles!customer_id(email)')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!invoice) {
      console.log('⚠️  No invoices found. Skipping test notification creation.')
    } else {
      console.log(`   Using customer ID: ${invoice.customer_id}`)
      console.log(`   Customer email: ${invoice.profiles?.email}`)

      const testNotification = {
        user_id: invoice.customer_id,
        type: 'test_diagnostic',
        title: 'Test Notification (Diagnostic)',
        message: 'This is a test notification created by the diagnostic script',
        link: '/portal/dashboard',
        reference_id: null,
        reference_type: 'diagnostic',
        is_read: false,
      }

      const { data: created, error: createError } = await supabaseAdmin
        .from('customer_notifications')
        .insert(testNotification)
        .select()
        .single()

      if (createError) {
        console.error('❌ Failed to create test notification:')
        console.error('   Message:', createError.message)
        console.error('   Code:', createError.code)
        console.error('   Details:', createError.details)
        console.error('   Hint:', createError.hint)
      } else {
        console.log('✅ Test notification created successfully!')
        console.log(`   Notification ID: ${created.id}`)
        console.log(`   User ID: ${created.user_id}`)
        console.log('   You can verify this in the customer portal')

        // Try to read it back
        const { data: readBack, error: readError } = await supabaseAdmin
          .from('customer_notifications')
          .select('*')
          .eq('id', created.id)
          .single()

        if (readError) {
          console.error('⚠️  Created but failed to read back:', readError.message)
        } else {
          console.log('✅ Successfully read back the notification')
        }
      }
    }
  } catch (err) {
    console.error('❌ Error during test creation:', err.message)
  }

  // 6. Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 DIAGNOSTIC SUMMARY')
  console.log('='.repeat(60))
  console.log(`
Next Steps:
1. Check the output above for any ❌ errors
2. If table exists but notifications aren't visible in portal:
   - Verify the customer user ID matches between invoices and auth
   - Check RLS policies on customer_notifications table
   - Check browser console for API errors when loading notifications
3. If test notification was created successfully:
   - Log into customer portal with the test customer account
   - Check if the test notification appears in the Notifications card
4. Check server logs when sending an invoice for any errors
`)

  console.log('✅ Diagnostics complete!\n')
}

// Run diagnostics
runDiagnostics().catch(err => {
  console.error('Fatal error running diagnostics:', err)
  process.exit(1)
})
