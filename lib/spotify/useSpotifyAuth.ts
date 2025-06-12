import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';

const SPOTIFY_CLIENT_ID = 'e92f6084d29743e9837f592c3556d311';
const SUPABASE_FUNCTION_URL = 'https://xyzcompanyabc.supabase.co/functions/v1/spotify-auth';

const redirectUri = Linking.createURL('/');

function base64URLEncode(str: Uint8Array): string {
  return btoa(String.fromCharCode(...str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeVerifier(): Promise<string> {
  const randomBytes = Crypto.getRandomBytes(64);
  return base64URLEncode(randomBytes);
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );
  return base64URLEncode(Uint8Array.from(atob(digest), c => c.charCodeAt(0)));
}

export async function loginWithSpotify() {
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const authUrl =
    'https://accounts.spotify.com/authorize?' +
    new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      scope: 'user-read-email user-read-private',
    });

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

  if (result.type !== 'success' || !result.url.includes('code=')) {
    throw new Error('Spotify login failed or was cancelled');
  }

  const code = new URL(result.url).searchParams.get('code');
  if (!code) throw new Error('No code returned from Spotify');

  const tokenRes = await fetch(SUPABASE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, code_verifier: codeVerifier }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Token exchange failed: ${tokenData?.error}`);

  return tokenData; // Contains access_token, refresh_token, etc.
}
