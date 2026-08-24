import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Activity,
  BookOpen,
  Boxes,
  FlaskConical,
  History,
  LayoutDashboard,
  Settings,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { USING_MOCK_API } from "@/lib/api/client";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/analyze", label: "New Policy Analysis", icon: Sparkles },
  { to: "/history", label: "Analysis History", icon: History },
  { to: "/scenarios", label: "Scenarios", icon: SlidersHorizontal },
  { to: "/evidence", label: "Evidence", icon: BookOpen },
  { to: "/models", label: "Models", icon: Boxes },
  { to: "/backtesting", label: "Backtesting", icon: FlaskConical },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[268px_1fr]">
      <aside className="sticky top-0 z-30 hidden h-screen flex-col border-r border-border bg-sidebar/80 px-5 py-7 backdrop-blur-xl lg:flex">
        <Brand />
        <nav className="mt-9 flex flex-1 flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/" }}
              activeProps={{
                className: "bg-primary/12 text-primary border-primary/25",
              }}
              inactiveProps={{
                className:
                  "text-muted-foreground border-transparent hover:bg-sidebar-accent hover:text-foreground",
              }}
              className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="rounded-xl border border-border bg-surface-raised/70 p-4">
          <p className="label-eyebrow">Data source</p>
          <p className="mt-2 flex items-center gap-2 text-sm text-foreground">
            <span
              className={`size-2 rounded-full ${USING_MOCK_API ? "bg-warning" : "bg-positive"}`}
              aria-hidden
            />
            {USING_MOCK_API ? "Mock API fixtures" : "FastAPI backend"}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            All figures render exactly as returned by the analysis service.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-xl md:px-9 md:py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="lg:hidden">
                <Brand compact />
              </div>
              <h1 className="mt-2 truncate text-xl font-semibold text-foreground md:text-2xl lg:mt-0">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
            {actions}
          </div>
          <nav className="mt-4 -mx-1 flex gap-1 overflow-x-auto pb-1 lg:hidden">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "bg-primary/12 text-primary border-primary/25" }}
                inactiveProps={{ className: "text-muted-foreground border-border" }}
                className="whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium"
              >
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 px-5 py-6 md:px-9 md:py-9">
          <div className="mx-auto w-full max-w-[1500px] space-y-6 md:space-y-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <span className="grid size-9 place-items-center rounded-xl border border-primary/30 bg-primary/12">
        <Activity className="size-4 text-primary" aria-hidden />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-base font-semibold tracking-tight text-foreground">
          POLARIS
        </span>
        {!compact && (
          <span className="block text-[11px] tracking-wide text-muted-foreground">
            AI Policy Intelligence Studio
          </span>
        )}
      </span>
    </Link>
  );
}
