import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="soft-card max-w-xl p-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">404</p>
        <h1 className="mt-4 text-4xl font-semibold text-white">This workspace page does not exist.</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          The requested route could not be found. Head back to the dashboard to continue managing clients, subscriptions, sessions, payments, and reports.
        </p>
        <Link to="/dashboard" className="primary-button mx-auto mt-6 w-fit">
          Return to dashboard
        </Link>
      </div>
    </div>
  )
}
