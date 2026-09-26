// Web replicas of the client's primitives in src/voiceless/ui.tsx. Same
// structure and class names mapped onto mock.css.
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function Page({ title, description, fill, children }: { title: string; description?: string; fill?: boolean; children: ReactNode }) {
  return (
    <div className={'sx-page' + (fill ? ' fill' : '')}>
      <div className="sx-page-in">
        <h1 className="sx-h1">{title}</h1>
        {description && <p className="sx-desc">{description}</p>}
        <div className="sx-stack">{children}</div>
      </div>
    </div>
  )
}

export function Section({
  icon,
  title,
  description,
  actions,
  toolbar,
  fill,
  children,
}: {
  icon?: ReactNode
  title?: string
  description?: string
  actions?: ReactNode
  toolbar?: ReactNode
  fill?: boolean
  children: ReactNode
}) {
  return (
    <section className={'sx-section' + (fill ? ' fill' : '')}>
      {title && (
        <div className="sx-section-head">
          {icon && <span className="sx-icon-accent">{icon}</span>}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>{title}</div>
            {description && <div className="sx-hint">{description}</div>}
          </div>
          {actions}
        </div>
      )}
      {toolbar && <div className="sx-toolbar">{toolbar}</div>}
      <div className="sx-rows">{children}</div>
    </section>
  )
}

export function Row({ title, description, stacked, children }: { title: ReactNode; description?: ReactNode; stacked?: boolean; children?: ReactNode }) {
  return (
    <div className={'sx-row' + (stacked ? ' stacked' : '')}>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="sx-row-title">{title}</div>
        {description && <div className="sx-row-desc">{description}</div>}
      </div>
      {children !== undefined && <div className="sx-row-ctl">{children}</div>}
    </div>
  )
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={'sx-switch' + (checked ? ' on' : '')} onClick={() => onChange(!checked)}>
      <i />
    </button>
  )
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="sx-seg" role="group">
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} className={o.value === value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function TabbedSection<T extends string>({
  tabs,
  value,
  onChange,
  children,
}: {
  tabs: { value: T; label: string; icon?: ReactNode; description?: string }[]
  value: T
  onChange: (v: T) => void
  children: ReactNode
}) {
  const active = tabs.find((t) => t.value === value)
  return (
    <Section
      toolbar={
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {active?.icon && <span className="sx-icon-accent">{active.icon}</span>}
            <Segmented value={value} onChange={onChange} options={tabs.map(({ value, label }) => ({ value, label }))} />
          </div>
          {active?.description && <p className="sx-hint">{active.description}</p>}
        </>
      }
    >
      {children}
    </Section>
  )
}

export function Chip({ children, neutral }: { children: ReactNode; neutral?: boolean }) {
  return <span className={'sx-chip' + (neutral ? ' neutral' : '')}>{children}</span>
}

export function StatusPill({ ok, children }: { ok: boolean; children: ReactNode }) {
  return (
    <span className={'sx-status' + (ok ? ' ok' : '')}>
      <i />
      {children}
    </span>
  )
}

export function Btn({
  variant = 'secondary',
  children,
  ...props
}: { variant?: 'secondary' | 'ghost' | 'danger' | 'primary' } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={'sx-btn' + (variant === 'secondary' ? '' : ' ' + variant)} {...props}>
      {children}
    </button>
  )
}
