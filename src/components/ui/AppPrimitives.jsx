import { LoaderCircle, Search, X } from 'lucide-react'
import { sentenceCase } from '../../utils/formatters'

export function PageHeader({
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
          CSPMS workspace
        </span>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 md:text-base">{description}</p>
        </div>
      </div>
      {action}
    </div>
  )
}

export function Panel({ children, className = '' }) {
  return <div className={`soft-card ${className}`.trim()}>{children}</div>
}

export function StatCard({
  label,
  value,
  hint,
}) {
  return (
    <Panel className="p-5">
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <p className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{value}</p>
        {hint ? <span className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">{hint}</span> : null}
      </div>
    </Panel>
  )
}

export function StatusBadge({ value }) {
  const normalized = value?.toLowerCase() ?? 'unknown'

  const styles = {
    active: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    lead: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    inactive: 'border-slate-400/20 bg-slate-400/10 text-slate-200',
    pending: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
    cancelled: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
    scheduled: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
    completed: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    paid: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200',
    failed: 'border-rose-400/20 bg-rose-400/10 text-rose-200',
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ${styles[normalized] ?? 'border-slate-500/20 bg-slate-500/10 text-slate-200'}`}
    >
      {sentenceCase(value)}
    </span>
  )
}

export function LoadingState({ message = 'Loading data...' }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-center text-slate-400">
      <LoaderCircle className="h-8 w-8 animate-spin text-cyan-400" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

export function EmptyState({
  title,
  description,
  action,
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 p-8">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">{description}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  )
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search records...',
}) {
  return (
    <label className="relative block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-input pl-10"
      />
    </label>
  )
}

export function PrimaryButton({
  children,
  onClick,
  type = 'button',
  disabled,
  className = '',
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`primary-button ${className}`.trim()}>
      {children}
    </button>
  )
}

export function SecondaryButton({
  children,
  onClick,
  disabled,
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="secondary-button">
      {children}
    </button>
  )
}

export function Modal({
  title,
  description,
  open,
  onClose,
  children,
}) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="soft-card w-full max-w-2xl overflow-hidden">
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 p-2 text-slate-400 transition hover:border-white/20 hover:text-white"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
