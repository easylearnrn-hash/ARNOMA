import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const GMAIL_CLIENT_ID = Deno.env.get('GMAIL_CLIENT_ID')!;
const GMAIL_CLIENT_SECRET = Deno.env.get('GMAIL_CLIENT_SECRET')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async req => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle GET request (OAuth callback from Google)
    if (req.method === 'GET') {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      // Handle OAuth error
      if (error) {
        console.error('❌ OAuth error:', error);
        const returnUrl = state ? JSON.parse(decodeURIComponent(state)).returnUrl : 'https://www.richyfesta.com';
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${returnUrl}?gmail_auth=error&error=${error}` },
        });
      }

      if (!code) {
        throw new Error('Missing authorization code');
      }

      const stateData = state ? JSON.parse(decodeURIComponent(state)) : {};
      const userId = stateData.userId || 'admin';
      const returnUrl = stateData.returnUrl || 'https://www.richyfesta.com';

      console.log('📧 Exchanging authorization code for tokens...');
      console.log('User ID:', userId);
      console.log('Return URL:', returnUrl);

      // Build redirect URI for this Edge Function
      const redirectUri = `${SUPABASE_URL}/functions/v1/gmail-oauth-callback`;

      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GMAIL_CLIENT_ID,
          client_secret: GMAIL_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('❌ Token exchange failed:', error);
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${returnUrl}?gmail_auth=error&error=token_exchange_failed` },
        });
      }

      const tokenData = await tokenResponse.json();
      console.log('✅ Token exchange successful');
      console.log('Has access_token:', !!tokenData.access_token);
      console.log('Has refresh_token:', !!tokenData.refresh_token);

      if (!tokenData.refresh_token) {
        console.warn('⚠️ No refresh token received. User may need to revoke access first.');
      }

      const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

      // Store tokens in Supabase
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

      // UPSERT: Insert new record or UPDATE existing one on user_id conflict
      const { error: dbError } = await supabase.from('gmail_credentials').upsert(
        {
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          client_id: GMAIL_CLIENT_ID,
          client_secret: GMAIL_CLIENT_SECRET,
          token_type: tokenData.token_type || 'Bearer',
          expires_at: expiresAt.toISOString(),
          scopes: tokenData.scope,
        },
        { onConflict: 'user_id' }
      );

      if (dbError) {
        console.error('❌ Database error:', dbError);
        return new Response(null, {
          status: 302,
          headers: { 'Location': `${returnUrl}?gmail_auth=error&error=database_error` },
        });
      }

      console.log('✅ Credentials saved to database');

      // Redirect back to app with success
      return new Response(null, {
        status: 302,
        headers: { 'Location': `${returnUrl}?gmail_auth=success` },
      });
    }

    // Handle POST request (legacy API endpoint for manual token exchange)
    const { code, userId } = await req.json();

    if (!code || !userId) {
      throw new Error('Missing code or userId');
    }

    const redirectUri = req.headers.get('origin') || 'https://www.richyfesta.com';

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000);

    // Store tokens in Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // UPSERT: Insert new record or UPDATE existing one on user_id conflict
    const { error: dbError } = await supabase.from('gmail_credentials').upsert(
      {
        user_id: userId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        client_id: GMAIL_CLIENT_ID,
        client_secret: GMAIL_CLIENT_SECRET,
        token_type: tokenData.token_type || 'Bearer',
        expires_at: expiresAt.toISOString(),
        scopes: tokenData.scope,
      },
      { onConflict: 'user_id' }
    );

    if (dbError) throw dbError;

    return new Response(
      JSON.stringify({
        success: true,
        access_token: tokenData.access_token,
        expires_at: expiresAt.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
