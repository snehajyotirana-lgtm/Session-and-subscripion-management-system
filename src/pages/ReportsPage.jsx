import { useEffect, useMemo, useState } from 'react'
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { fetchCollection, getApiErrorMessage } from '../services/api'
import { formatCurrency, monthLabel } from '../utils/formatters'
import { EmptyState, LoadingState, PageHeader, Panel, StatCard } from '../components/ui/AppPrimitives'

const pieColors = ['#22d3ee', '#8b5cf6', '#f59e0b', '#f43f5e', '#34d399']

export function ReportsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [sessions, setSessions] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      setError(null)

      try {
        const [subscriptionsData, sessionsData, paymentsData] = await Promise.all([
          fetchCollection('subscriptions'),
          fetchCollection('sessions'),
          fetchCollection('payments'),
        ])

        setSubscriptions(subscriptionsData)
        setSessions(sessionsData)
        setPayments(paymentsData)
      } catch (loadError) {
        setError(getApiErrorMessage(loadError))
      } finally {
        setLoading(false)
      }
    }

    void loadReports()
  }, [])

  const summary = useMemo(() => {
    const paidPayments = payments.filter((payment) => payment.status === 'paid')
    const paidTotal = paidPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
    const failedTotal = payments.filter((payment) => payment.status === 'failed').length
    const activePlans = subscriptions.filter((subscription) => subscription.status === 'active').length
    const sessionUtilization = sessions.length
      ? `${Math.round(
          (sessions.reduce((total, session) => total + Number(session.attendance || 0), 0) /
            Math.max(
              sessions.reduce((total, session) => total + Number(session.seats || 0), 0),
              1,
            )) *
            100,
        )}%`
      : '0%'

    return [
      { label: 'Collected revenue', value: formatCurrency(paidTotal) },
      { label: 'Active subscriptions', value: activePlans.toString() },
      { label: 'Failed payments', value: failedTotal.toString() },
      { label: 'Attendance utilization', value: sessionUtilization },
    ]
  }, [payments, sessions, subscriptions])

  const revenueLine = useMemo(() => {
    const bucket = new Map()
    payments.forEach((payment) => {
      const key = monthLabel(payment.paidAt)
      bucket.set(key, (bucket.get(key) ?? 0) + Number(payment.amount || 0))
    })

    return Array.from(bucket.entries()).map(([month, revenue]) => ({ month, revenue }))
  }, [payments])

  const subscriptionMix = useMemo(() => {
    const bucket = new Map()
    subscriptions.forEach((subscription) => {
      bucket.set(subscription.plan, (bucket.get(subscription.plan) ?? 0) + 1)
    })

    return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }))
  }, [subscriptions])

  const paymentStatusMix = useMemo(() => {
    const bucket = new Map()
    payments.forEach((payment) => {
      bucket.set(payment.status, (bucket.get(payment.status) ?? 0) + 1)
    })

    return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }))
  }, [payments])

  const trainerPerformance = useMemo(() => {
    const bucket = new Map()
    sessions.forEach((session) => {
      const current = bucket.get(session.trainer) ?? { attendance: 0, seats: 0 }
      current.attendance += Number(session.attendance || 0)
      current.seats += Number(session.seats || 0)
      bucket.set(session.trainer, current)
    })

    return Array.from(bucket.entries()).map(([trainer, values]) => ({
      trainer,
      utilization: values.seats ? Math.round((values.attendance / values.seats) * 100) : 0,
    }))
  }, [sessions])

  return (
    <section className="space-y-6">
      <PageHeader
        title="Reports and analytics"
        description="Monitor revenue, plan mix, trainer utilization, and collection health using live backend data surfaced through interactive charts."
      />

      {loading ? <LoadingState message="Preparing your analytics workspace..." /> : null}

      {!loading && error ? (
        <Panel>
          <EmptyState
            title="Unable to load reports"
            description={`${error} Ensure the relevant API endpoints are available and returning data arrays or wrapped payloads.`}
          />
        </Panel>
      ) : null}

      {!loading && !error ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <StatCard key={item.label} label={item.label} value={item.value} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Revenue performance</h2>
                <p className="mt-1 text-sm text-slate-400">Total invoice volume by month, regardless of payment status.</p>
              </div>
              {revenueLine.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueLine}>
                      <XAxis dataKey="month" stroke="#64748b" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '16px',
                        }}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee', r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No payment activity yet" description="Revenue charts will appear when invoices or collections are posted." />
              )}
            </Panel>

            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Subscription mix</h2>
                <p className="mt-1 text-sm text-slate-400">Breakdown of customer demand across plan types.</p>
              </div>
              {subscriptionMix.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={subscriptionMix} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={6}>
                        {subscriptionMix.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '16px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No subscriptions recorded" description="Create subscription records to understand product mix and plan demand." />
              )}
            </Panel>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Payment health</h2>
                <p className="mt-1 text-sm text-slate-400">Visualize settled, pending, and failed payment outcomes.</p>
              </div>
              {paymentStatusMix.length ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentStatusMix} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={6}>
                        {paymentStatusMix.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '16px',
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyState title="No invoice states to chart" description="Payment status insights will populate once invoice activity begins." />
              )}
            </Panel>

            <Panel className="p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Trainer utilization</h2>
                <p className="mt-1 text-sm text-slate-400">Compare expected seat capacity with actual attendance by trainer.</p>
              </div>
              {trainerPerformance.length ? (
                <div className="space-y-4">
                  {trainerPerformance.map((item) => (
                    <div key={item.trainer} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-white">{item.trainer}</span>
                        <span className="text-slate-400">{item.utilization}%</span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                          style={{ width: `${Math.min(item.utilization, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No trainer analytics yet" description="Trainer utilization appears once sessions and attendance values are stored." />
              )}
            </Panel>
          </div>
        </>
      ) : null}
    </section>
  )
}
