import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'
import react from '@astrojs/react'
import keystatic from '@keystatic/astro'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  site: 'https://clawbot.wiki',
  adapter: cloudflare({ prerenderEnvironment: 'node' }),
  integrations: [
    react({ include: ['**/*.{jsx,tsx,js}'] }),
    keystatic(),
    starlight({
      title: 'ClawBot Wiki',
      description: 'OpenClaw ecosystem compatibility tracker',
      logo: { src: './public/favicon.svg' },
      defaultLocale: 'root',
      locales: {
        root: { label: '中文', lang: 'zh-CN' },
        en: { label: 'English' },
      },
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/xjh1994/clawbot-wiki' },
      ],
      sidebar: [
        {
          label: 'Overview',
          translations: { 'zh-CN': '概览' },
          items: [
            { label: 'All Claws', translations: { 'zh-CN': '全部 Claw' }, link: '/claws/' },
            { label: 'Providers & Deals', translations: { 'zh-CN': '云厂商 & 套餐' }, link: '/providers/' },
            { label: 'Submit / Edit', translations: { 'zh-CN': '投稿 / 编辑' }, link: '/submit/' },
          ],
        },
        {
          label: 'By Vendor',
          translations: { 'zh-CN': '按厂商' },
          items: [
            { label: 'Tencent 腾讯', link: '/claws/?vendor=tencent' },
            { label: 'ByteDance 字节', link: '/claws/?vendor=bytedance' },
            { label: 'Alibaba 阿里', link: '/claws/?vendor=alibaba' },
            { label: 'Baidu 百度', link: '/claws/?vendor=baidu' },
            { label: 'Open Source', translations: { 'zh-CN': '开源' }, link: '/claws/?category=open-source' },
          ],
        },
      ],
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.svg' } },
      ],
    }),
  ],
})
