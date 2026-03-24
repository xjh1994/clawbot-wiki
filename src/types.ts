export type CompatLevel = 'yes' | 'no' | 'partial' | 'unknown'
export type ProviderType = 'public-cloud' | 'paas' | 'operator'

export interface ProviderDeal {
  name: string
  name_zh?: string
  product?: string        // 产品类型，如 ECS / 轻量服务器 / VPS
  cpu?: number
  ram?: number            // GB
  disk?: number           // GB
  disk_type?: string      // SSD / ESSD / HDD 等
  bandwidth?: number      // Mbps
  price: number           // 价格数字
  currency?: 'cny' | 'usd'
  period: 'month' | 'year' | 'once'
  eligible: 'new' | 'all' | 'member' | 'enterprise'
  limited?: boolean       // 是否限量/需抢购
  url?: string
  note?: string
  note_zh?: string
  verified_date?: string
}

export interface ProviderEntry {
  slug: string
  name: string
  name_en?: string
  website: string
  type: ProviderType
  logo_color?: string
  description?: string
  description_zh?: string
  deals: ProviderDeal[]
  tags?: string[]
  last_updated: string
}
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
