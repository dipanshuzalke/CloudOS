import { useState } from "react";
import { motion } from "motion/react";
import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { algorithms } from "@/features/cloud/data";

export const Route = createFileRoute("/os/scheduler")({
  head: () => ({
    meta: [
      { title: "Scheduler — Cloud OS" },
      { name: "description", content: "Compare Round Robin, Least Loaded, Best Fit and First Fit placement policies and select an active scheduler." },
      { property: "og:title", content: "Scheduler — Cloud OS" },
      { property: "og:description", content: "Four placement policies, visualised with their trade-offs and complexity." },
    ],
  }),
  component: SchedulerPage,
});

function SchedulerPage() {
  const [active, setActive] = useState("least-loaded");

  return (
    <div className="space-y-9">
      <PageHeader
        title="Scheduling Policies"
        subtitle="Choose how incoming workloads are placed across the fleet."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {algorithms.map((a, i) => {
          const selected = active === a.id;
          return (
            <Reveal key={a.id} delay={i * 0.06}>
              <motion.button
                onClick={() => setActive(a.id)}
                whileTap={{ scale: 0.99 }}
                className={`glass-panel lift relative h-full w-full rounded-[30px] p-8 text-left transition-shadow ${
                  selected ? "ring-2 ring-primary/60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-semibold">{a.name}</h2>
                    <p className="text-[14px] text-muted-foreground">{a.tagline}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] ${
                      selected ? "bg-primary text-primary-foreground" : "border border-glass-border text-muted-foreground"
                    }`}
                  >
                    {selected ? <Check className="size-3" /> : null}
                    {selected ? "Active" : a.complexity}
                  </span>
                </div>

                <div className="mt-6 flex gap-1.5">
                  {Array.from({ length: 18 }).map((_, k) => (
                    <motion.span
                      key={k}
                      className={`h-12 flex-1 rounded-md ${selected ? "bg-primary/25" : "bg-primary/10"}`}
                      animate={{ scaleY: [0.5, 1, 0.5], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: (k % 6) * 0.18 + i * 0.1 }}
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

                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-glass-border pt-5 text-[13px]">
                  <div>
                    <div className="text-muted-foreground">Utilisation</div>
                    <div className="text-[17px] font-semibold tabular-nums">{a.utilization}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Throughput</div>
                    <div className="text-[17px] font-semibold tabular-nums">{a.throughput}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Complexity</div>
                    <div className="font-mono text-[15px] font-semibold">{a.complexity}</div>
                  </div>
                </div>
              </motion.button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}