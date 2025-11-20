import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

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
    const { userId } = await req.json();

    if (!userId) {
      throw new Error('Missing userId');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Get stored credentials
    const { data: credentials, error: fetchError } = await supabase
      .from('gmail_credentials')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', userId)
      .single();

    if (fetchError || !credentials) {
      throw new Error('No Gmail credentials found for this user');
    }

    // Check if token is expired
    const expiresAt = new Date(credentials.expires_at);
    const now = new Date();

    if (expiresAt <= now) {
      return new Response(
        JSON.stringify({
          success: false,
          expired: true,
          message: 'Token expired. Use gmail-refresh-token endpoint.',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        access_token: credentials.access_token,
        expires_at: credentials.expires_at,
        has_refresh_token: !!credentials.refresh_token,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
