import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/os/shell";
import { Counter, Reveal } from "@/components/motion/reveal";
import {
  AlgorithmRadarChart,
  NetworkLineChart,
  TaskDonutChart,
  UsageAreaChart,
  WeeklyBarChart,
} from "@/components/cloud/charts";

export const Route = createFileRoute("/os/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Cloud OS" },
      { name: "description", content: "CPU, memory, network, task success, resource allocation and scheduling policy comparison charts." },
      { property: "og:title", content: "Analytics — Cloud OS" },
      { property: "og:description", content: "Deep performance analytics for the simulated cloud fleet." },
    ],
  }),
  component: AnalyticsPage,
});

const summary = [
  { label: "Task success rate", value: 97.4, suffix: "%", decimals: 1 },
  { label: "Avg. placement time", value: 42, suffix: " ms", decimals: 0 },
  { label: "Fleet efficiency", value: 88, suffix: "%", decimals: 0 },
  { label: "Scaling events (7d)", value: 26, suffix: "", decimals: 0 },
];

function AnalyticsPage() {
  return (
    <div className="space-y-9">
      <PageHeader
        title="Performance Analytics"
        subtitle="How the fleet behaves over time, and how each scheduling policy compares."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06}>
            <div className="glass-panel lift rounded-[26px] p-6">
              <div className="text-[2rem] leading-none font-semibold tracking-tight">
                <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="mt-2.5 text-[14px] text-muted-foreground">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal className="lg:col-span-2">
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">CPU & memory over 24 hours</div>
            <UsageAreaChart height={280} />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Network throughput</div>
            <NetworkLineChart height={240} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Task outcomes</div>
            <TaskDonutChart height={240} />
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Resource allocation by day</div>
            <WeeklyBarChart height={260} />
          </div>
        </Reveal>
        <Reveal delay={0.18}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Algorithm comparison</div>
            <AlgorithmRadarChart height={260} />
          </div>
        </Reveal>
      </div>
    </div>
  );
}