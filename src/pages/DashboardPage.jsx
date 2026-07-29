import { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchCollection, getApiErrorMessage } from '../services/api'
import { formatCurrency, formatDate, monthLabel } from '../utils/formatters'
import { EmptyState, LoadingState, PageHeader, Panel, StatCard, StatusBadge } from '../components/ui/AppPrimitives'

export function DashboardPage() {
  const [data, setData] = useState({
    clients: [],
    subscriptions: [],
    sessions: [],
    payments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true)
      setError(null)

      try {
        const [clients, subscriptions, sessions, payments] = await Promise.all([
          fetchCollection('clients'),
          fetchCollection('subscriptions'),
          fetchCollection('sessions'),
          fetchCollection('payments'),
        ])

        setData({ clients, subscriptions, sessions, payments })
      } catch (loadError) {
        setError(getApiErrorMessage(loadError))
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [])

  const metrics = useMemo(() => {
    const activeSubscriptions = data.subscriptions.filter((item) => item.status === 'active').length
    const outstandingPayments = data.payments.filter((item) => item.status !== 'paid').length
    const completedSessions = data.sessions.filter((item) => item.status === 'completed')
    const sessionCompletionRate = data.sessions.length
      ? `${Math.round((completedSessions.length / data.sessions.length) * 100)}%`
      : '0%'

    const revenue = data.payments
      .filter((item) => item.status === 'paid')
      .reduce((total, payment) => total + Number(payment.amount || 0), 0)

    return [
      { label: 'Total clients', value: data.clients.length.toString(), hint: `${data.clients.filter((item) => item.status === 'active').length} active` },
      { label: 'Active subscriptions', value: activeSubscriptions.toString(), hint: `${data.subscriptions.length} overall` },
      { label: 'Collected revenue', value: formatCurrency(revenue), hint: `${outstandingPayments} outstanding` },
      { label: 'Session completion', value: sessionCompletionRate, hint: `${completedSessions.length} completed` },
    ]
  }, [data])

  const revenueByMonth = useMemo(() => {
    const buckets = new Map()

    data.payments
      .filter((payment) => payment.status === 'paid')
      .forEach((payment) => {
        const key = monthLabel(payment.paidAt)
        buckets.set(key, (buckets.get(key) ?? 0) + Number(payment.amount || 0))
      })

    return Array.from(buckets.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [data.payments])

  const attendanceTrend = useMemo(() => {
    const buckets = new Map()

    data.sessions.forEach((session) => {
      const key = monthLabel(session.sessionDate)
      const current = buckets.get(key) ?? { attendance: 0, seats: 0 }
      current.attendance += Number(session.attendance || 0)
      current.seats += Number(session.seats || 0)
      buckets.set(key, current)
    })

    return Array.from(buckets.entries()).map(([month, values]) => ({
      month,
      utilization: values.seats ? Math.round((values.attendance / values.seats) * 100) : 0,
    }))
  }, [data.sessions])

  const recentPayments = useMemo(
    () =>
      [...data.payments]
        .sort((first, second) => +new Date(second.paidAt) - +new Date(first.paidAt))
        .slice(0, 5),
    [data.payments],
  )

  const upcomingSessions = useMemo(
    () =>
      [...data.sessions]
        .sort((first, second) => +new Date(first.sessionDate) - +new Date(second.sessionDate))
        .slice(0, 5),
    [data.sessions],
  )

  return (
    <section className="space-y-6">
      <PageHeader
        title="Operational dashboard"
        description="See your customer pipeline, active subscriptions, revenue performance, and upcoming sessions at a glance."
      />

      {loading ? <LoadingState message="Building your operational overview..." /> : null}

      {!loading && error ? (
        <Panel>
          <EmptyState
            title="Unable to load dashboard"
            description={`${error} Check the API base URL and backend availability, then refresh the page.`}
          />
        </Panel>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <StatCard key={metric.label} label={metric.label} value={metric.value} hint={metric.hint} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Revenue trend</h2>
                <p className="mt-1 text-sm text-slate-400">Paid collections aggregated by billing month.</p>
              </div>
              {revenueByMonth.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueByMonth}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.7} />
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '16px',
                        }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#22d3ee" fill="url(#revenueGradient)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No paid invoices yet" description="Paid payment entries will appear here as soon as collections start coming in." />
              )}
            </Panel>

            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Attendance utilization</h2>
                <p className="mt-1 text-sm text-slate-400">Average seat fill rate across planned and delivered sessions.</p>
              </div>
              {attendanceTrend.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={attendanceTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.12)" />
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '16px',
                        }}
                      />
                      <Bar dataKey="utilization" radius={[14, 14, 0, 0]} fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No session history yet" description="Session utilization becomes visible once schedules and attendance data are available." />
              )}
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel className="overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">Recent payments</h2>
                <p className="mt-1 text-sm text-slate-400">Latest payment activity across all customers.</p>
              </div>
              {recentPayments.length ? (
                <div className="divide-y divide-white/5">
                  {recentPayments.map((payment) => (
                    <div key={`${payment.invoiceId}-${payment.paidAt}`} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{payment.clientName}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {payment.invoiceId} • {formatDate(payment.paidAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-white">{formatCurrency(Number(payment.amount || 0))}</span>
                        <StatusBadge value={payment.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No payments recorded" description="When invoices are posted or settled, the latest transactions will surface here." />
              )}
            </Panel>

            <Panel className="overflow-hidden">
              <div className="border-b border-white/10 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">Upcoming sessions</h2>
                <p className="mt-1 text-sm text-slate-400">Upcoming classroom, onboarding, or coaching sessions in your calendar.</p>
              </div>
              {upcomingSessions.length ? (
                <div className="divide-y divide-white/5">
                  {upcomingSessions.map((session) => (
                    <div key={`${session.title}-${session.sessionDate}`} className="flex flex-col gap-3 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium text-white">{session.title}</p>
                        <p className="mt-1 text-sm text-slate-400">
                          {session.trainer} • {session.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-slate-300">{formatDate(session.sessionDate)}</span>
                        <StatusBadge value={session.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No sessions scheduled" description="Add sessions to begin monitoring delivery dates, trainers, and attendance." />
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </section>
  )
}
