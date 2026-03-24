import { parse as parseYaml } from 'yaml'
import type { ClawEntry, ProviderEntry } from '../types'

const rawFiles = import.meta.glob('./claws/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const rawProviders = import.meta.glob('./providers/*.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

function parseAll(): ClawEntry[] {
  return Object.entries(rawFiles)
    .map(([path, raw]) => {
      const slug = path.replace('./claws/', '').replace('.yaml', '')
      const data = parseYaml(raw) as object
      return { slug, ...data } as ClawEntry
    })
    .sort((a, b) => {
      const a360 = a.slug === '360-security-claw'
      const b360 = b.slug === '360-security-claw'
      if (a360 !== b360) return a360 ? 1 : -1
      return a.name.localeCompare(b.name)
    })
}

export function getAllClaws(): ClawEntry[] {
  return parseAll()
}

export function getClawBySlug(slug: string): ClawEntry | undefined {
  return parseAll().find(c => c.slug === slug)
}

export function getAllProviders(): ProviderEntry[] {
  return Object.entries(rawProviders)
    .map(([path, raw]) => {
      const slug = path.replace('./providers/', '').replace('.yaml', '')
      const data = parseYaml(raw) as object
      return { slug, ...data } as ProviderEntry
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'zh'))
}

export function getStats() {
  const claws = parseAll()
  return {
    total: claws.length,
    wechat: claws.filter(c => c.channels.wechat_clawbot === 'yes').length,
    opensource: claws.filter(c => c.category === 'open-source').length,
  }
}
