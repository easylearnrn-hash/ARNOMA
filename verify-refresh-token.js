// Run this in browser console after connecting Gmail
// to verify refresh token is stored in database

const { createClient } = supabase;
const supabaseClient = createClient(
  'https://zlvnxvrzotamhpezqedr.supabase.co',
  'YOUR_ANON_KEY' // Replace with your anon key from Supabase dashboard
);

async function verifyRefreshToken() {
  const { data, error } = await supabaseClient
    .from('gmail_credentials')
    .select('user_id, email, refresh_token, expires_at')
    .eq('user_id', 'admin')
    .single();

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('✅ Gmail credentials found!');
  console.log('📧 Email:', data.email);
  console.log('🔑 Has refresh token:', data.refresh_token ? 'YES ✅' : 'NO ❌');
  console.log('⏰ Token expires:', new Date(data.expires_at));
}

verifyRefreshToken();
