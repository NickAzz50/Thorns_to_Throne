/// <reference types="https://jsr.io/@supabase/functions-js/edge-runtime.d.ts" />

import { serve } from 'https://edge-runtime.supabase.com/functions/serve.ts';

const client_id = Deno.env.get('SPOTIFY_CLIENT_ID')!;
const client_secret = Deno.env.get('SPOTIFY_CLIENT_SECRET')!;
const redirect_uri = Deno.env.get('SPOTIFY_REDIRECT_URI')!;

serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { code, code_verifier } = await req.json();

    if (!code || !code_verifier) {
      return new Response(JSON.stringify({ error: 'Missing code or code_verifier' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri,
      client_id,
      code_verifier,
    });

    const authHeader = 'Basic ' + btoa(`${client_id}:${client_secret}`);

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Spotify token error:', data);
      return new Response(JSON.stringify({ error: 'Token exchange failed', details: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
