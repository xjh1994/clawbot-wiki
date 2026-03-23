import { defineConfig } from 'astro/config'
import starlight from '@astrojs/starlight'

export default defineConfig({
  site: 'https://clawbot.wiki',
  integrations: [
    starlight({
      title: 'ClawBot Wiki',
      description: 'OpenClaw ecosystem compatibility tracker',
      logo: { src: './public/favicon.svg' },
      defaultLocale: 'zh',
      locales: {
        en: { label: 'English' },
        zh: { label: '中文', lang: 'zh-CN' },
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
            { label: 'All Claws', translations: { 'zh-CN': '全部 Claw' }, link: '/zh/claws/' },
            { label: 'Submit / Edit', translations: { 'zh-CN': '投稿 / 编辑' }, link: '/zh/submit/' },
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
  output: 'static',
})
