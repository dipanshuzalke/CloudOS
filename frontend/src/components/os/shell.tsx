import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Bell,
  Cloud,
  Command,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Moon,
  Search,
  Server,
  Settings,
  Sun,
  Timer,
} from "lucide-react";

const nav = [
  { to: "/os", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/os/vms", label: "Virtual Machines", icon: Server, exact: false },
  { to: "/os/tasks", label: "Tasks", icon: ListChecks, exact: false },
  { to: "/os/scheduler", label: "Scheduler", icon: Timer, exact: false },
  { to: "/os/analytics", label: "Analytics", icon: Gauge, exact: false },
  { to: "/os/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function useClock() {
  const [now, setNow] = useState<string>("");
  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    tick();
    const id = setInterval(tick, 1000 * 20);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <motion.aside
      initial={{ opacity: 0, x: -28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="glass sticky top-6 hidden h-[calc(100vh-3rem)] w-[264px] shrink-0 flex-col rounded-[28px] p-4 lg:flex"
    >
      <div className="flex items-center gap-2.5 px-3 py-3">
        <Cloud className="size-5 text-primary" />
        <span className="text-[15px] font-semibold tracking-tight">Cloud OS</span>
      </div>

      <nav className="mt-4 space-y-1">
        {nav.map((item, i) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          return (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                to={item.to}
                className={`relative flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-medium transition-colors ${
                  active
                    ? "bg-primary-soft text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2">
        <button
          onClick={() => setDark((d) => !d)}
          className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-[14px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
          {dark ? "Light appearance" : "Dark appearance"}
        </button>
        <div className="flex items-center gap-3 rounded-2xl border border-glass-border px-3.5 py-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary-soft text-[12px] font-semibold text-primary">
            AR
          </span>
          <div className="leading-tight">
            <div className="text-[13px] font-medium">Ada Reyes</div>
            <div className="text-[12px] text-muted-foreground">Infrastructure lead</div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
}

export function Topbar() {
  const clock = useClock();
  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="glass sticky top-6 z-30 flex items-center gap-4 rounded-[24px] px-4 py-3"
    >
      <div className="flex flex-1 items-center gap-2.5 rounded-2xl bg-muted/70 px-3.5 py-2.5">
        <Search className="size-4 text-muted-foreground" />
        <input
          placeholder="Search virtual machines, tasks, policies…"
          className="w-full bg-transparent text-[14px] outline-none placeholder:text-muted-foreground"
        />
        <span className="hidden items-center gap-1 rounded-lg border border-glass-border px-2 py-0.5 text-[11px] text-muted-foreground sm:flex">
          <Command className="size-3" />K
        </span>
      </div>
      <span className="hidden text-[13px] tabular-nums text-muted-foreground sm:block">{clock}</span>
      <button className="relative rounded-xl p-2.5 transition-colors hover:bg-muted">
        <Bell className="size-4.5 text-muted-foreground" />
        <span className="absolute top-2 right-2 size-1.5 rounded-full bg-primary" />
      </button>
      <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-[12px] font-semibold text-background">
        AR
      </span>
    </motion.header>
  );
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="glass fixed inset-x-4 bottom-4 z-40 flex justify-between rounded-[24px] px-3 py-2 lg:hidden">
      {nav.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-label={item.label}
            className={`rounded-2xl p-3 transition-colors ${active ? "bg-primary-soft text-primary" : "text-muted-foreground"}`}
          >
            <item.icon className="size-5" />
          </Link>
        );
      })}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1 className="text-[clamp(2rem,3.4vw,2.75rem)] leading-tight font-semibold">{title}</h1>
      <p className="mt-2.5 max-w-2xl text-[16px] text-muted-foreground">{subtitle}</p>
    </motion.div>
  );
}