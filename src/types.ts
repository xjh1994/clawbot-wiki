export type CompatLevel = 'yes' | 'no' | 'partial' | 'unknown'
export type ForkType = 'fork' | 'compatible' | 'independent' | 'unrelated' | 'unknown'
export type Category = 'desktop' | 'cloud' | 'enterprise' | 'open-source' | 'embedded' | 'other'
export type DeploymentType = 'local' | 'cloud' | 'both'

export interface ClawEntry {
  slug: string
  name: string
  name_zh: string
  vendor: string
  vendor_zh: string
  logo?: string
  website?: string
  github?: string
  release_date?: string
  category: Category
  description: string
  description_zh: string

  openclaw: {
    fork_type: ForkType
    protocol_compat: 'full' | 'partial' | 'none' | 'unknown'
    soul_md: boolean | null
    mcp_support: boolean | null
    skills_store: boolean | null
    openclaw_lag_days: number | null
  }

  channels: {
    wechat_clawbot: CompatLevel
    qq: CompatLevel
    wecom: CompatLevel
    feishu: CompatLevel
    dingtalk: CompatLevel
    telegram: CompatLevel
    discord: CompatLevel
  }

  models: {
    default: string | null
    supported: string[]
    local_model: boolean | null
  }

  deployment: DeploymentType

  cloud_deploy?: Array<{ name: string; url?: string }>

  tags: string[]
  verified: boolean
  notes?: string
  notes_zh?: string
  last_updated: string
}
