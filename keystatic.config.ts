import { config, collection, fields } from '@keystatic/core'

const channelField = (label: string) =>
  fields.select({
    label,
    options: [
      { label: '支持', value: 'yes' },
      { label: '不支持', value: 'no' },
      { label: '部分支持', value: 'partial' },
      { label: '未知', value: 'unknown' },
    ],
    defaultValue: 'unknown',
  })

export default config({
  storage: {
    kind: 'github',
    repo: { owner: 'xjh1994', name: 'clawbot-wiki' },
  },

  ui: {
    brand: { name: 'ClawBot Wiki 后台' },
  },

  collections: {
    claws: collection({
      label: 'Claw 产品库',
      slugField: 'name',
      path: 'src/data/claws/*',
      format: 'yaml',
      schema: {
        name: fields.text({ label: '产品名（英文）' }),
        name_zh: fields.text({ label: '产品名（中文）' }),
        vendor: fields.text({ label: '厂商（英文）' }),
        vendor_zh: fields.text({ label: '厂商（中文）' }),
        website: fields.url({ label: '官网', validation: { isRequired: false } }),
        github: fields.url({ label: 'GitHub 地址', validation: { isRequired: false } }),
        release_date: fields.text({ label: '发布日期', validation: { isRequired: false } }),
        category: fields.select({
          label: '分类',
          options: [
            { label: '桌面端', value: 'desktop' },
            { label: '云服务', value: 'cloud' },
            { label: '企业级', value: 'enterprise' },
            { label: '开源', value: 'open-source' },
            { label: '嵌入式', value: 'embedded' },
            { label: '其他', value: 'other' },
          ],
          defaultValue: 'other',
        }),
        description: fields.text({ label: '产品描述（英文）', multiline: true }),
        description_zh: fields.text({ label: '产品描述（中文）', multiline: true }),
        openclaw: fields.object({
          label: 'OpenClaw 兼容性',
          fields: {
            fork_type: fields.select({
              label: '分支类型',
              options: [
                { label: 'Fork', value: 'fork' },
                { label: '兼容', value: 'compatible' },
                { label: '独立', value: 'independent' },
                { label: '无关', value: 'unrelated' },
                { label: '未知', value: 'unknown' },
              ],
              defaultValue: 'unknown',
            }),
            protocol_compat: fields.select({
              label: '协议兼容度',
              options: [
                { label: '完全兼容', value: 'full' },
                { label: '部分兼容', value: 'partial' },
                { label: '不兼容', value: 'none' },
                { label: '未知', value: 'unknown' },
              ],
              defaultValue: 'unknown',
            }),
            soul_md: fields.checkbox({ label: '支持 SOUL.md', defaultValue: false }),
            mcp_support: fields.checkbox({ label: '支持 MCP', defaultValue: false }),
            skills_store: fields.checkbox({ label: '技能商店', defaultValue: false }),
            openclaw_lag_days: fields.integer({ label: '落后天数', validation: { isRequired: false } }),
          },
        }),
        channels: fields.object({
          label: '渠道支持',
          fields: {
            wechat_clawbot: channelField('微信 ClawBot'),
            qq: channelField('QQ'),
            wecom: channelField('企业微信'),
            feishu: channelField('飞书'),
            dingtalk: channelField('钉钉'),
            telegram: channelField('Telegram'),
            discord: channelField('Discord'),
          },
        }),
        models: fields.object({
          label: '模型支持',
          fields: {
            default: fields.text({ label: '默认模型', validation: { isRequired: false } }),
            supported: fields.array(fields.text({ label: '模型名' }), { label: '支持模型列表' }),
            local_model: fields.checkbox({ label: '支持本地模型', defaultValue: false }),
          },
        }),
        deployment: fields.select({
          label: '部署方式',
          options: [
            { label: '本地', value: 'local' },
            { label: '云端', value: 'cloud' },
            { label: '本地+云端', value: 'both' },
            { label: '其他', value: 'other' },
          ],
          defaultValue: 'other',
        }),
        tags: fields.array(fields.text({ label: '标签' }), { label: '标签' }),
        notes: fields.text({ label: '备注（英文）', multiline: true, validation: { isRequired: false } }),
        notes_zh: fields.text({ label: '备注（中文）', multiline: true, validation: { isRequired: false } }),
        verified: fields.checkbox({ label: '已验证', defaultValue: false }),
        last_updated: fields.text({ label: '最后更新' }),
      },
    }),
  },
})
