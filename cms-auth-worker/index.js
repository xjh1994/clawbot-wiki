/**
 * Cloudflare Worker — GitHub OAuth proxy for Decap CMS
 * Env vars required: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
 */

const ALLOWED_ORIGINS = ['https://clawbot.wiki', 'https://www.clawbot.wiki']

function cors(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors(origin) })
    }

    // Step 1: Redirect to GitHub OAuth
    if (url.pathname === '/auth') {
      const params = new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        scope: 'public_repo',
        redirect_uri: `${url.origin}/callback`,
      })
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302)
    }

    // Step 2: GitHub redirects back with ?code=
    if (url.pathname === '/callback') {
      const code = url.searchParams.get('code')
      if (!code) return new Response('Missing code', { status: 400 })

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET,
          code,
        }),
      })
      const { access_token, error } = await tokenRes.json()
      if (error || !access_token) return new Response(`OAuth error: ${error}`, { status: 400 })

      // Post token back to opener window (Decap CMS ping-pong pattern)
      const html = `<!doctype html><html><body><script>
        (function() {
          const token = ${JSON.stringify(access_token)};
          const msg = JSON.stringify({ token, provider: 'github' });
          function send(target, origin) {
            target.postMessage('authorization:github:success:' + msg, origin);
          }
          // Ping-pong: wait for CMS to ping, then reply to its origin
          window.addEventListener('message', function(e) {
            if (e.data === 'authorizing:github') {
              send(e.source, e.origin);
              setTimeout(function() { window.close(); }, 200);
            }
          });
          // Fallback: direct postMessage if opener is still available
          if (window.opener) {
            send(window.opener, '*');
            setTimeout(function() { window.close(); }, 500);
          }
        })();
      </script></body></html>`
      return new Response(html, { headers: { 'Content-Type': 'text/html' } })
    }

    return new Response('Not found', { status: 404 })
  },
}
