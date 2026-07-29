import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useLocation, useNavigate } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import { useAuth } from '../context/AuthContext'
import { getApiErrorMessage } from '../services/api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: 'admin@cspms.local',
      password: 'Admin@123',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setIsSubmitting(true)
    try {
      await login(values)
      const nextPath = location.state?.from?.pathname ?? '/dashboard'
      navigate(nextPath, { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-950 shadow-2xl shadow-cyan-950/20 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_45%),linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,1))] p-10 lg:flex lg:flex-col">
          <span className="inline-flex w-fit rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">
            CSPMS SaaS UI
          </span>
          <div className="mt-10 space-y-5">
            <h1 className="max-w-xl text-5xl font-semibold tracking-tight text-white">
              Run subscriptions, sessions, and cash flow from one polished control room.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-300">
              The Client Subscription and Payment Management System keeps your client lifecycle, renewals, delivery calendar, collections, and reporting aligned in a single responsive workspace.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              { title: 'Secure auth', detail: 'Token-backed sessions with protected routing and workspace restoration.' },
              { title: 'Live operations', detail: 'Actionable tables, forms, modals, and stateful resource management.' },
              { title: 'Revenue insight', detail: 'Recharts visualizations for pipeline, retention, sessions, and payments.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            ))}
          </div>

          <div className="relative mt-auto">
            <div className="absolute inset-0 rounded-[28px] bg-cyan-400/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-900/60 p-6">
              <img src={heroImage} alt="CSPMS dashboard illustration" className="mx-auto max-h-[320px] w-auto object-contain drop-shadow-[0_24px_48px_rgba(8,145,178,0.2)]" />
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-xl space-y-8">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Welcome back</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight text-white">Sign in to CSPMS</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Access dashboards, manage customers, track session delivery, and keep renewals moving.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: 'Protected routes' },
                { icon: Mail, label: 'Email login' },
                { icon: LockKeyhole, label: 'Persistent sessions' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                  <item.icon className="mb-2 h-5 w-5 text-cyan-300" />
                  {item.label}
                </div>
              ))}
            </div>

            <form onSubmit={(event) => void onSubmit(event)} className="space-y-5 rounded-[28px] border border-white/10 bg-slate-900/70 p-6 shadow-2xl backdrop-blur">
              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Email address</span>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    placeholder="admin@cspms.local"
                    className="field-input pl-11"
                    {...register('email', { required: 'Email is required.' })}
                  />
                </div>
                {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Password</span>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    placeholder="Enter your password"
                    className="field-input pl-11"
                    {...register('password', { required: 'Password is required.' })}
                  />
                </div>
                {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
              </label>

              <button type="submit" disabled={isSubmitting} className="primary-button w-full justify-center">
                {isSubmitting ? 'Signing you in...' : 'Sign in'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="rounded-[28px] border border-dashed border-white/10 bg-white/5 p-5 text-sm leading-6 text-slate-300">
              <p className="font-semibold text-white">Seeded development credentials</p>
              <p className="mt-2">Email: admin@cspms.local</p>
              <p>Password: Admin@123</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
