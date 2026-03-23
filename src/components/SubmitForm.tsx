import { useState } from 'react'

const CATEGORIES = [
  { value: 'desktop', label: '桌面端 / Desktop' },
  { value: 'cloud', label: '云服务 / Cloud' },
  { value: 'enterprise', label: '企业级 / Enterprise' },
  { value: 'open-source', label: '开源 / Open Source' },
  { value: 'embedded', label: '嵌入式 / Embedded' },
  { value: 'other', label: '其他 / Other' },
]

const COMPAT = [
  { value: 'yes', label: '支持 / Yes' },
  { value: 'no', label: '不支持 / No' },
  { value: 'partial', label: '部分支持 / Partial' },
  { value: 'unknown', label: '未知 / Unknown' },
]

const DEPLOYMENTS = [
  { value: 'local', label: '本地 / Local' },
  { value: 'cloud', label: '云端 / Cloud' },
  { value: 'both', label: '本地+云端 / Both' },
  { value: 'other', label: '其他 / Other' },
]

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SubmitForm() {
  const [status, setStatus] = useState<Status>('idle')
  const [prUrl, setPrUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const fd = new FormData(e.currentTarget)
    const payload = Object.fromEntries(fd.entries())

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json() as { pr_url?: string; error?: string }
      if (!res.ok) {
        throw new Error(json.error ?? 'Unknown error')
      }
      setPrUrl(json.pr_url ?? '')
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : String(err))
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '1.5rem', border: '1px solid #16a34a', borderRadius: '8px', background: '#f0fdf4' }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#15803d' }}>✓ 提交成功！PR 已创建</p>
        <p style={{ margin: '0.5rem 0 0' }}>
          <a href={prUrl} target="_blank" rel="noopener noreferrer">{prUrl}</a>
        </p>
        <p style={{ margin: '0.5rem 0 0', color: '#6b7280', fontSize: '0.9em' }}>
          维护者审核通过后会合并上线。感谢贡献！
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '640px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="产品名（英文）*" name="name" required placeholder="e.g. WeChat ClawBot" />
        <Field label="产品名（中文）" name="name_zh" placeholder="e.g. 微信 ClawBot" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="厂商（英文）*" name="vendor" required placeholder="e.g. Tencent" />
        <Field label="厂商（中文）" name="vendor_zh" placeholder="e.g. 腾讯" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Field label="官网" name="website" placeholder="https://..." />
        <Field label="GitHub" name="github" placeholder="https://github.com/..." />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        <Field label="发布日期" name="release_date" placeholder="2026-03" />
        <SelectField label="分类" name="category" options={CATEGORIES} />
        <SelectField label="部署方式" name="deployment" options={DEPLOYMENTS} />
      </div>
      <Field label="产品描述（英文）" name="description" multiline placeholder="Brief description in English..." />
      <Field label="产品描述（中文）" name="description_zh" multiline placeholder="简短的产品描述……" />
      <SelectField label="微信 ClawBot 支持" name="wechat_clawbot" options={COMPAT} />
      <Field label="标签（逗号分隔）" name="tags" placeholder="e.g. tencent, wechat, security" />
      <Field label="备注 / 补充说明" name="notes" multiline placeholder="其他需要维护者了解的信息……" />

      {status === 'error' && (
        <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9em' }}>提交失败：{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        style={{
          padding: '0.6rem 1.5rem',
          background: status === 'loading' ? '#9ca3af' : '#ea580c',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 600,
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          alignSelf: 'flex-start',
        }}
      >
        {status === 'loading' ? '提交中…' : '提交 PR'}
      </button>
    </form>
  )
}

function Field({
  label,
  name,
  required,
  placeholder,
  multiline,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
  multiline?: boolean
}) {
  const style: React.CSSProperties = {
    width: '100%',
    padding: '0.4rem 0.6rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      {multiline ? (
        <textarea name={name} required={required} placeholder={placeholder} rows={3} style={style} />
      ) : (
        <input type="text" name={name} required={required} placeholder={placeholder} style={style} />
      )}
    </label>
  )
}

function SelectField({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: { value: string; label: string }[]
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.9rem' }}>
      <span style={{ fontWeight: 500 }}>{label}</span>
      <select
        name={name}
        style={{
          width: '100%',
          padding: '0.4rem 0.6rem',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          background: 'white',
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
