// Override the @keystatic/astro integration-injected API route.
// @keystatic/astro@5.0.6 accesses context.locals.runtime.env which throws in Astro v6.
// Instead, we read credentials from cloudflare:workers env bindings directly.
// We pass Set-Cookie headers through as-is to avoid re-serialisation issues.

export const prerender = false

import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic'
import keystaticConfig from '../../../../keystatic.config'

export const ALL = async (context: Parameters<typeof import('astro').APIRoute>[0]) => {
  // In Astro v6 + @astrojs/cloudflare, use cloudflare:workers to access bindings
  const { env } = await import('cloudflare:workers' as string) as {
    env: Record<string, string | undefined>
  }

  const handler = makeGenericAPIRouteHandler(
    {
      config: keystaticConfig,
      clientId: env.KEYSTATIC_GITHUB_CLIENT_ID,
      clientSecret: env.KEYSTATIC_GITHUB_CLIENT_SECRET,
      secret: env.KEYSTATIC_SECRET,
    },
    { slugEnvName: 'PUBLIC_KEYSTATIC_GITHUB_APP_SLUG' }
  )

  const { body, headers, status } = await handler(context.request)

  // Collect all headers, keeping set-cookie as raw strings to avoid re-serialisation
  const responseHeaders: [string, string][] = []
  if (headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        responseHeaders.push([key, value])
      }
    } else if (typeof (headers as Headers).entries === 'function') {
      const h = headers as Headers
      for (const [key, value] of h.entries()) {
        responseHeaders.push([key, value])
      }
      if ('getSetCookie' in h && typeof (h as any).getSetCookie === 'function') {
        for (const sc of (h as any).getSetCookie() as string[]) {
          responseHeaders.push(['set-cookie', sc])
        }
      }
    } else {
      for (const [key, value] of Object.entries(headers as Record<string, string>)) {
        responseHeaders.push([key, value])
      }
    }
  }

  return new Response(body, { status, headers: responseHeaders })
}
