export const prerender = false

interface SubmitPayload {
  name: string
  name_zh: string
  vendor: string
  vendor_zh: string
  website: string
  github: string
  release_date: string
  category: string
  description: string
  description_zh: string
  wechat_clawbot: string
  deployment: string
  tags: string
  notes: string
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function buildYaml(data: SubmitPayload, today: string): string {
  const tags = data.tags
    ? data.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .map((t) => (/^\d/.test(t) ? `"${t}"` : t))
        .join(', ')
    : ''

  const lines: string[] = [
    `name: ${data.name}`,
    `name_zh: ${data.name_zh || ''}`,
    `vendor: ${data.vendor}`,
    `vendor_zh: ${data.vendor_zh || ''}`,
  ]
  if (data.website) lines.push(`website: ${data.website}`)
  if (data.github) lines.push(`github: ${data.github}`)
  if (data.release_date) lines.push(`release_date: "${data.release_date}"`)
  lines.push(`category: ${data.category || 'other'}`)
  if (data.description) lines.push(`description: ${data.description}`)
  if (data.description_zh) lines.push(`description_zh: ${data.description_zh}`)
  lines.push(
    '',
    'openclaw:',
    '  fork_type: unknown',
    '  protocol_compat: unknown',
    '  soul_md: null',
    '  mcp_support: null',
    '  skills_store: null',
    '  openclaw_lag_days: null',
    '',
    'channels:',
    `  wechat_clawbot: "${data.wechat_clawbot || 'unknown'}"`,
    '  qq: "unknown"',
    '  wecom: "unknown"',
    '  feishu: "unknown"',
    '  dingtalk: "unknown"',
    '  telegram: "unknown"',
    '  discord: "unknown"',
    '',
    'models:',
    '  default: null',
    '  supported: []',
    '  local_model: null',
    '',
    `deployment: ${data.deployment || 'other'}`,
    `tags: [${tags}]`,
  )
  if (data.notes) lines.push(`notes: ${data.notes}`)
  lines.push(`verified: false`, `last_updated: "${today}"`, '')
  return lines.join('\n')
}

export const POST = async ({ request }: { request: Request }) => {
  const { env } = await import('cloudflare:workers' as string) as {
    env: Record<string, string | undefined>
  }
  const token = env.CLAWBOT_SUBMIT_TOKEN
  if (!token) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let data: SubmitPayload
  try {
    data = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  if (!data.name?.trim() || !data.vendor?.trim()) {
    return new Response(JSON.stringify({ error: 'name and vendor are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const owner = 'xjh1994'
  const repo = 'clawbot-wiki'
  const today = new Date().toISOString().slice(0, 10)
  const slug = slugify(data.name)
  const filename = `${slug}.yaml`
  const filePath = `src/data/claws/${filename}`
  const branch = `contributions/submit-${slug}-${Date.now()}`
  const yamlContent = buildYaml(data, today)

  const gh = (path: string, options?: RequestInit) =>
    fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...((options?.headers as Record<string, string>) ?? {}),
      },
    })

  // Get main branch SHA
  const refRes = await gh(`/repos/${owner}/${repo}/git/ref/heads/main`)
  if (!refRes.ok) {
    const body = await refRes.text()
    return new Response(JSON.stringify({ error: 'Failed to fetch main branch', status: refRes.status, detail: body }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const { object } = await refRes.json() as { object: { sha: string } }

  // Create branch
  const branchRes = await gh(`/repos/${owner}/${repo}/git/refs`, {
    method: 'POST',
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: object.sha }),
  })
  if (!branchRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to create branch' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Commit file
  const contentB64 = btoa(unescape(encodeURIComponent(yamlContent)))
  const commitRes = await gh(`/repos/${owner}/${repo}/contents/${filePath}`, {
    method: 'PUT',
    body: JSON.stringify({
      message: `feat: add ${data.name} via community submission`,
      content: contentB64,
      branch,
    }),
  })
  if (!commitRes.ok) {
    return new Response(JSON.stringify({ error: 'Failed to commit file' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Open PR
  const prRes = await gh(`/repos/${owner}/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title: `feat: add ${data.name}`,
      body: `Community submission via clawbot.wiki/submit\n\n**Product**: ${data.name}\n**Vendor**: ${data.vendor}\n\n> Please review and fill in any missing fields before merging.`,
      head: branch,
      base: 'main',
    }),
  })
  if (!prRes.ok) {
    const err = await prRes.text()
    return new Response(JSON.stringify({ error: 'Failed to create PR', detail: err }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  const pr = await prRes.json() as { html_url: string; number: number }

  return new Response(JSON.stringify({ pr_url: pr.html_url, pr_number: pr.number }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
