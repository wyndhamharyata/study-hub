import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { type Env } from './env';

function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function importPrivateKey(pem: string): Promise<CryptoKey> {
  const pemContents = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binaryDer = Uint8Array.from(atob(pemContents), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey(
    'pkcs8',
    binaryDer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function getGoogleAccessToken(serviceAccount: { client_email: string; private_key: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const header = base64UrlEncode(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/identitytoolkit',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );

  const key = await importPrivateKey(serviceAccount.private_key);
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    new TextEncoder().encode(`${header}.${payload}`)
  );
  const sig = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${header}.${payload}.${sig}`;

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}

const app = new Hono<{ Bindings: Env }>()
  .use(
    '*',
    cors({
      origin: [
        'http://localhost:5173',
        'https://studyhub.mwyndham.dev',
      ],
      allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    })
  )
  .delete('/api/users/:uid', async (c) => {
    const uid = c.req.param('uid');
    try {
      const serviceAccountJson = await c.env.Secrets.get('FIREBASE_SERVICE_ACCOUNT');
      if (!serviceAccountJson) {
        return c.json({ error: 'Service account not configured' }, 500);
      }
      const serviceAccount = JSON.parse(serviceAccountJson);
      const accessToken = await getGoogleAccessToken(serviceAccount);

      const url = `https://identitytoolkit.googleapis.com/v1/projects/${serviceAccount.project_id}/accounts:delete`;
      const body = JSON.stringify({ localId: uid });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body,
      });

      const responseBody = await response.text();

      if (!response.ok) {
        return c.json({ error: responseBody, status: response.status, url, uid }, 500);
      }

      return c.json({
        success: true,
        debug: { status: response.status, responseBody, url, uid },
      });
    } catch (err) {
      return c.json({ error: String(err) }, 500);
    }
  })
  .post('/api/rooms/:roomId/banner', async (c) => {
    const roomId = c.req.param('roomId');
    try {
      const formData = await c.req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return c.json({ error: 'No file provided' }, 400);
      }
      const key = `banners/${roomId}-${file.name}`;
      await c.env.StudyHubBucket.put(key, file);
      const url = `https://${c.env.BUCKET_DOMAIN}/${key}`;
      return c.json({ success: true, url });
    } catch (err) {
      return c.json({ error: String(err) }, 500);
    }
  })
  .get('*', async (c) => {
    try {
      const assetResponse = await c.env.ASSETS.fetch(c.req.url);
      if (assetResponse.status !== 404) {
        return assetResponse;
      }
      const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
      return c.html(await indexResponse.text());
    } catch {
      const indexResponse = await c.env.ASSETS.fetch(new URL('/', c.req.url));
      return c.html(await indexResponse.text());
    }
  });

export default app;

export type AppType = typeof app;
