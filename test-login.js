// Test Supabase login directly
// Open browser console on any page and run this

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'YOUR_SUPABASE_URL',  // Replace with your actual URL
  'YOUR_SUPABASE_ANON_KEY'  // Replace with your actual anon key
);

// Test login
async function testLogin() {
  console.log('Testing login...');

  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'ahoff1888@gmail.com',
    password: 'YOUR_PASSWORD_HERE'  // Your actual password
  });

  if (error) {
    console.error('❌ Login failed:', error);
  } else {
    console.log('✅ Login successful!', data);
  }
}

testLogin();
