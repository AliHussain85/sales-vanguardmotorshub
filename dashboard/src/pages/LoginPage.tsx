import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Loader2, LockKeyhole } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Logo } from '../components/Logo'

export function LoginPage() {
  const { session, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const result = await signIn(email.trim(), password)
    if (result.error) {
      setError(result.error)
    }
    setSubmitting(false)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-neutral-100 px-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.08),transparent_55%)]" />

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo size="lg" className="mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-neutral-900">Vanguard Motors Hub</h1>
          <p className="mt-2 text-sm text-neutral-500">Sign in to access the sales dashboard</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-white p-6 shadow-xl shadow-neutral-200/60"
        >
          <div className="mb-5 flex items-center gap-2 text-sm font-medium text-neutral-700">
            <LockKeyhole className="h-4 w-4 text-gold" />
            Secure login
          </div>

          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              placeholder="you@vanguardmotorshub.com"
            />
          </label>

          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-neutral-500">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition focus:border-gold/50 focus:ring-2 focus:ring-gold/20"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
