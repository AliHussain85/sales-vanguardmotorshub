import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { dashboardPages } from '../config/navigation'

export function HomePage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-neutral-900">Welcome back</h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-500">
            Your internal sales tools in one place. Pick a page from the sidebar or open one below.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {dashboardPages.map((page) => (
            <Link
              key={page.id}
              to={page.path}
              className="group rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:border-gold/40 hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold-dark ring-1 ring-gold/20">
                <page.icon className="h-5 w-5" />
              </div>
              <h2 className="text-base font-semibold text-neutral-900">{page.label}</h2>
              <p className="mt-1 text-sm text-neutral-500">{page.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gold-dark opacity-0 transition group-hover:opacity-100">
                Open
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
