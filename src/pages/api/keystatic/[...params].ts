// Override the @keystatic/astro integration-injected API route.
// @keystatic/astro@5.0.6 accesses context.locals.runtime.env which throws in Astro v6.
// Instead, we read credentials from cloudflare:workers env bindings directly.

export const prerender = false

import { makeGenericAPIRouteHandler } from '@keystatic/core/api/generic'
import { parseString } from 'set-cookie-parser'
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

  // Replicate cookie-handling from @keystatic/astro/api (set-cookie-parser)
  const headersMap = new Map<string, string[]>()
  if (headers) {
    if (Array.isArray(headers)) {
      for (const [key, value] of headers) {
        const k = key.toLowerCase()
        if (!headersMap.has(k)) headersMap.set(k, [])
        headersMap.get(k)!.push(value)
      }
    } else if (typeof (headers as Headers).entries === 'function') {
      for (const [key, value] of (headers as Headers).entries()) {
        headersMap.set(key.toLowerCase(), [value])
      }
      if ('getSetCookie' in headers && typeof (headers as any).getSetCookie === 'function') {
        const sc = (headers as any).getSetCookie() as string[]
        if (sc?.length) headersMap.set('set-cookie', sc)
      }
    } else {
      for (const [key, value] of Object.entries(headers as Record<string, string>)) {
        headersMap.set(key.toLowerCase(), [value])
      }
    }
  }

  const setCookieHeaders = headersMap.get('set-cookie')
  headersMap.delete('set-cookie')
  if (setCookieHeaders) {
    for (const raw of setCookieHeaders) {
      const { name, value, sameSite: ss, ...opts } = parseString(raw)
      const sameSite = ss?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined
      context.cookies.set(name, value, {
        domain: opts.domain,
        expires: opts.expires,
        httpOnly: opts.httpOnly,
        maxAge: opts.maxAge,
        path: opts.path,
        sameSite: sameSite === 'lax' || sameSite === 'strict' || sameSite === 'none' ? sameSite : undefined,
      })
    }
  }

  return new Response(body, {
    status,
    headers: [...headersMap.entries()].flatMap(([k, vals]) => vals.map((v) => [k, v])),
  })
}
