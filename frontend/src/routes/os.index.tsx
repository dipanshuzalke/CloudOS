import { createFileRoute } from "@tanstack/react-router";
import { motion } from "motion/react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Cpu,
  HardDrive,
  MemoryStick,
  Network,
  Plus,
  Rocket,
  Scale,
  Server,
  Timer,
} from "lucide-react";
import { PageHeader } from "@/components/os/shell";
import { Counter, Reveal } from "@/components/motion/reveal";
import {
  NetworkLineChart,
  TaskDonutChart,
  UsageAreaChart,
  WeeklyBarChart,
} from "@/components/cloud/charts";
import { activity, virtualMachines } from "@/features/cloud/data";
import { VMCard } from "@/components/cloud/vm-card";

export const Route = createFileRoute("/os/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Cloud OS" },
      {
        name: "description",
        content: "Fleet overview with live CPU, memory, storage, network and workload telemetry.",
      },
      { property: "og:title", content: "Dashboard — Cloud OS" },
      { property: "og:description", content: "Monitor infrastructure, workloads and resource utilization." },
    ],
  }),
  component: DashboardPage,
});

const kpis = [
  { icon: Server, label: "Running VMs", value: 12, suffix: "", hint: "5 regions" },
  { icon: Cpu, label: "CPU", value: 58, suffix: "%", hint: "fleet average" },
  { icon: MemoryStick, label: "Memory", value: 41, suffix: "%", hint: "of 384 GB" },
  { icon: Activity, label: "Tasks", value: 17, suffix: "", hint: "9 queued" },
  { icon: HardDrive, label: "Storage", value: 620, suffix: " GB", hint: "provisioned" },
  { icon: Network, label: "Network", value: 125, suffix: " Mbps", hint: "egress now" },
];

const quickActions = [
  { icon: Plus, label: "Create VM" },
  { icon: Timer, label: "Create Task" },
  { icon: Scale, label: "Open Scheduler" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Rocket, label: "Deploy Workload" },
];

const activityIcon = {
  scale: Scale,
  task: Activity,
  alert: AlertTriangle,
  scheduler: Timer,
  vm: Server,
};

function DashboardPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Cloud Infrastructure Overview"
        subtitle="Monitor infrastructure, workloads and resource utilization."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.06}>
            <div className="glass-panel lift rounded-[26px] p-6">
              <div className="flex items-center justify-between">
                <k.icon className="size-4.5 text-primary" />
                <span className="text-[12px] text-muted-foreground">{k.hint}</span>
              </div>
              <div className="mt-6 text-[2.25rem] leading-none font-semibold tracking-tight">
                <Counter value={k.value} suffix={k.suffix} />
              </div>
              <div className="mt-2 text-[14px] text-muted-foreground">{k.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">CPU & memory utilisation</div>
            <UsageAreaChart height={250} />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="glass-panel h-full rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">Task distribution</div>
            <TaskDonutChart height={250} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">Weekly usage</div>
            <WeeklyBarChart height={210} />
          </div>
        </Reveal>
        <Reveal delay={0.14} className="lg:col-span-2">
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">Network throughput</div>
            <NetworkLineChart height={210} />
          </div>
        </Reveal>
      </div>

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">Live infrastructure</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {virtualMachines.slice(0, 6).map((vm, i) => (
            <Reveal key={vm.id} delay={i * 0.05}>
              <VMCard vm={vm} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((a, i) => (
            <Reveal key={a.label} delay={i * 0.05}>
              <button className="glass-panel lift flex w-full items-center gap-3 rounded-[22px] px-5 py-5 text-left text-[15px] font-medium">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft">
                  <a.icon className="size-4.5 text-primary" />
                </span>
                {a.label}
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">Recent activity</h2>
        <div className="glass-panel rounded-[26px] p-7">
          <ol className="relative space-y-7 border-l border-border pl-7">
            {activity.map((a, i) => {
              const Icon = activityIcon[a.kind];
              return (
                <motion.li
                  key={a.title + i}
                  initial={{ opacity: 0, x: 12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                  className="relative"
                >
                  <span className="absolute top-0.5 -left-[43px] flex size-8 items-center justify-center rounded-full border border-glass-border bg-card">
                    <Icon className="size-3.5 text-primary" />
                  </span>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-[15px] font-medium">{a.title}</div>
                    <div className="text-[12px] text-muted-foreground">{a.time}</div>
                  </div>
                  <p className="mt-1 text-[14px] text-muted-foreground">{a.detail}</p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </section>
    </div>
  );
}