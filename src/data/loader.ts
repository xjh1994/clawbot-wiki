import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import yaml from 'js-yaml'
import type { ClawEntry } from '../types'

const DATA_DIR = join(process.cwd(), 'src/data/claws')

export function getAllClaws(): ClawEntry[] {
  const files = readdirSync(DATA_DIR).filter(f => f.endsWith('.yaml'))
  return files.map(file => {
    const slug = file.replace('.yaml', '')
    const raw = readFileSync(join(DATA_DIR, file), 'utf-8')
    const data = yaml.load(raw) as object
    return { slug, ...data } as ClawEntry
  }).sort((a, b) => a.name.localeCompare(b.name))
}

export function getClawBySlug(slug: string): ClawEntry | undefined {
  return getAllClaws().find(c => c.slug === slug)
}

export function getStats() {
  const claws = getAllClaws()
  return {
    total: claws.length,
    wechat: claws.filter(c => c.channels.wechat_clawbot === 'yes').length,
    opensource: claws.filter(c => c.category === 'open-source').length,
  }
}
