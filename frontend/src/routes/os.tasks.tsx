import { motion } from "motion/react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { tasks, type TaskState } from "@/features/cloud/data";

export const Route = createFileRoute("/os/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — Cloud OS" },
      { name: "description", content: "Running, queued, completed and failed workloads with progress, CPU, memory and estimated completion." },
      { property: "og:title", content: "Tasks — Cloud OS" },
      { property: "og:description", content: "Track simulated workloads across their full lifecycle." },
    ],
  }),
  component: TasksPage,
});

const groups: { state: TaskState; label: string; accent: string }[] = [
  { state: "running", label: "Running", accent: "bg-primary" },
  { state: "queued", label: "Queued", accent: "bg-muted-foreground" },
  { state: "completed", label: "Completed", accent: "bg-success" },
  { state: "failed", label: "Failed", accent: "bg-destructive" },
];

function TasksPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Workloads"
        subtitle="Every simulated task, from dispatch to completion, with the resources it holds."
      />
      {groups.map((g, gi) => {
        const items = tasks.filter((t) => t.state === g.state);
        return (
          <section key={g.state} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`size-2 rounded-full ${g.accent}`} />
              <h2 className="text-[19px] font-semibold">{g.label}</h2>
              <span className="text-[13px] text-muted-foreground">{items.length}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {items.map((t, i) => (
                <Reveal key={t.id} delay={gi * 0.03 + i * 0.05}>
                  <div className="glass-panel lift h-full rounded-[26px] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-mono text-[15px] font-semibold">{t.name}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">
                          {t.id} · {t.vm}
                        </div>
                      </div>
                      <span className="rounded-full border border-glass-border px-3 py-1 text-[12px] text-muted-foreground">
                        {t.eta}
                      </span>
                    </div>
                    <div className="mt-6 h-1.5 rounded-full bg-muted">
                      <motion.div
                        className={`h-full rounded-full ${t.state === "failed" ? "bg-destructive" : t.state === "completed" ? "bg-success" : "bg-primary"}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${t.progress}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between text-[12.5px] text-muted-foreground">
                      <span>{t.progress}% complete</span>
                      <span>
                        {t.cpu} vCPU · {t.ram} GB
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}