import { motion } from "motion/react";
import {
  Activity,
  BarChart3,
  Boxes,
  Cpu,
  Gauge,
  HardDrive,
  Layers,
  MemoryStick,
  Network,
  Scale,
  Server,
  Timer,
} from "lucide-react";
import { Reveal, Counter } from "@/components/motion/reveal";
import { algorithms } from "@/features/cloud/data";
import {
  AlgorithmRadarChart,
  NetworkLineChart,
  TaskDonutChart,
  UsageAreaChart,
  WeeklyBarChart,
} from "@/components/cloud/charts";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <Reveal>
        <span className="inline-flex rounded-full border border-glass-border bg-card/60 px-3.5 py-1.5 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
          {eyebrow}
        </span>
      </Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-6 text-[clamp(2.25rem,4.4vw,3rem)] leading-[1.06] font-semibold text-balance-tight">
          {title}
        </h2>
      </Reveal>
      {subtitle ? (
        <Reveal delay={0.14}>
          <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}

const overviewKpis = [
  { icon: Server, label: "Running VMs", value: 12, suffix: "", hint: "5 regions" },
  { icon: Cpu, label: "CPU utilisation", value: 58, suffix: "%", hint: "fleet average" },
  { icon: MemoryStick, label: "Memory", value: 41, suffix: "%", hint: "of 384 GB" },
  { icon: Activity, label: "Active tasks", value: 17, suffix: "", hint: "9 queued" },
  { icon: Network, label: "Network", value: 125, suffix: " Mbps", hint: "egress now" },
  { icon: HardDrive, label: "Storage", value: 620, suffix: " GB", hint: "provisioned" },
];

export function OverviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <SectionHeading
        eyebrow="Overview"
        title="Cloud infrastructure, observed end to end."
        subtitle="A single simulated control plane for virtual machines, workload scheduling, live telemetry and elastic capacity — modelled on how real fleets actually behave."
      />
      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {overviewKpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.07}>
            <div className="glass-panel lift rounded-[28px] p-7">
              <k.icon className="size-5 text-primary" />
              <div className="mt-7 text-[2.5rem] leading-none font-semibold tracking-tight">
                <Counter value={k.value} suffix={k.suffix} />
              </div>
              <div className="mt-3 text-[15px] font-medium">{k.label}</div>
              <div className="text-[13px] text-muted-foreground">{k.hint}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const features = [
  { icon: Server, title: "Virtual machine management", body: "Provision, pause and retire simulated nodes with live capacity, region and image metadata." },
  { icon: Timer, title: "Resource scheduling", body: "Four dispatch policies decide where each workload lands, and why." },
  { icon: Boxes, title: "Container-based compute", body: "Workloads are modelled as isolated container units with declared CPU and memory requests." },
  { icon: Scale, title: "Auto scaling", body: "Capacity expands and contracts against sustained pressure thresholds." },
  { icon: BarChart3, title: "Performance analytics", body: "Compare policies across utilisation, throughput and fairness over time." },
  { icon: Gauge, title: "Real-time monitoring", body: "Continuous CPU, memory, storage and network telemetry across the fleet." },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-surface/60 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Core features"
          title={
            <>
              Powerful infrastructure.
              <br />
              Simple experience.
            </>
          }
        />
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.06}>
              <div className="glass-panel lift h-full rounded-[28px] p-8">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft">
                  <f.icon className="size-5.5 text-primary" />
                </div>
                <h3 className="mt-7 text-[19px] font-semibold">{f.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const nodes = [
  { label: "React interface", detail: "Cloud OS shell" },
  { label: "Control plane", detail: "Simulated orchestration" },
  { label: "Scheduler", detail: "Placement policies" },
  { label: "Container runtime", detail: "Isolated workloads" },
  { label: "Monitoring", detail: "Telemetry stream" },
  { label: "Analytics", detail: "Historical insight" },
];

export function ArchitectureSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-28 sm:py-36">
      <SectionHeading
        eyebrow="Architecture"
        title="Every request, traced through the stack."
        subtitle="Workloads flow from the interface down to the runtime and back up as telemetry — the same loop a production cloud runs."
      />
      <div className="mt-16 space-y-3">
        {nodes.map((n, i) => (
          <Reveal key={n.label} delay={i * 0.08}>
            <div className="relative">
              <motion.div
                className="glass-panel flex items-center justify-between rounded-[26px] px-7 py-6"
                animate={{ boxShadow: ["var(--shadow-float)", "0 0 0 1px var(--primary-soft), var(--shadow-lift)", "var(--shadow-float)"] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: i * 0.6, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-4">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-[13px] font-semibold text-primary">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-[16px] font-semibold">{n.label}</div>
                    <div className="text-[13px] text-muted-foreground">{n.detail}</div>
                  </div>
                </div>
                <Layers className="size-4 text-muted-foreground" />
              </motion.div>
              {i < nodes.length - 1 && (
                <div className="relative mx-auto h-8 w-px overflow-hidden bg-border">
                  <motion.span
                    className="absolute inset-x-0 h-3 bg-primary"
                    animate={{ y: ["-12px", "32px"] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                  />
                </div>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function AlgorithmsSection() {
  return (
    <section className="bg-surface/60 py-28 sm:py-36">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Scheduling"
          title="Four ways to place a workload."
          subtitle="Each policy trades fairness, speed and density differently. The simulator makes those trade-offs visible."
        />
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {algorithms.map((a, i) => (
            <Reveal key={a.id} delay={i * 0.07}>
              <div className="glass-panel lift h-full rounded-[30px] p-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-[22px] font-semibold">{a.name}</h3>
                    <p className="text-[14px] text-muted-foreground">{a.tagline}</p>
                  </div>
                  <span className="rounded-full border border-glass-border px-3 py-1 font-mono text-[12px] text-muted-foreground">
                    {a.complexity}
                  </span>
                </div>
                <div className="mt-6 flex gap-1.5">
                  {Array.from({ length: 16 }).map((_, k) => (
                    <motion.span
                      key={k}
                      className="h-10 flex-1 rounded-md bg-primary/12"
                      animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }}
                      transition={{
                        duration: 2.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: (i === 0 ? k : i === 1 ? (k % 4) * 0.5 : i === 2 ? (15 - k) * 0.1 : k % 3) * 0.14,
                      }}
                    />
                  ))}
                </div>
                <p className="mt-6 text-[15px] leading-relaxed text-muted-foreground">{a.description}</p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">Advantages</div>
                    <ul className="mt-2 space-y-1.5 text-[14px]">
                      {a.advantages.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-success" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium tracking-wide text-muted-foreground uppercase">Trade-offs</div>
                    <ul className="mt-2 space-y-1.5 text-[14px]">
                      {a.disadvantages.map((x) => (
                        <li key={x} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-warning" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AnalyticsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <SectionHeading
        eyebrow="Analytics"
        title="Telemetry you can actually read."
        subtitle="Charts animate into view as the fleet reports CPU, memory, network and task outcomes."
      />
      <div className="mt-16 grid gap-5 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="glass-panel rounded-[30px] p-7">
            <div className="text-[15px] font-semibold">CPU & memory · 24h</div>
            <UsageAreaChart height={260} />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="glass-panel h-full rounded-[30px] p-7">
            <div className="text-[15px] font-semibold">Task distribution</div>
            <TaskDonutChart height={260} />
          </div>
        </Reveal>
        <Reveal delay={0.12}>
          <div className="glass-panel rounded-[30px] p-7">
            <div className="text-[15px] font-semibold">Network throughput</div>
            <NetworkLineChart height={220} />
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="glass-panel rounded-[30px] p-7">
            <div className="text-[15px] font-semibold">Weekly usage</div>
            <WeeklyBarChart height={220} />
          </div>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="glass-panel rounded-[30px] p-7">
            <div className="text-[15px] font-semibold">Policy performance</div>
            <AlgorithmRadarChart height={220} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const pillars = [
  "Container-based compute",
  "Cloud computing fundamentals",
  "Scheduling algorithms",
  "Real-time monitoring",
  "Elastic auto scaling",
  "Performance analytics",
  "A modern, premium interface",
];

export function WhySection() {
  return (
    <section className="bg-surface/60 py-28 sm:py-36">
      <div className="mx-auto max-w-5xl px-6">
        <SectionHeading eyebrow="Why this platform" title="Seven ideas, one coherent system." />
        <div className="mt-14 flex flex-wrap justify-center gap-3">
          {pillars.map((p, i) => (
            <Reveal key={p} delay={i * 0.05}>
              <span className="glass-panel lift inline-flex rounded-full px-6 py-3.5 text-[15px] font-medium">
                {p}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}