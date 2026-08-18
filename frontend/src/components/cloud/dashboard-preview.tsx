import { motion } from "motion/react";
import { Cpu, MemoryStick, Activity, Server } from "lucide-react";
import { UsageAreaChart } from "./charts";

function Bar({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary/80"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function DashboardPreview() {
  return (
    <motion.div
      className="glass-panel relative rounded-[32px] p-5"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center gap-2 pb-4">
        <span className="size-2.5 rounded-full bg-destructive/60" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-success/70" />
        <span className="ml-3 text-[11px] font-medium text-muted-foreground">
          Cloud OS · overview
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-glass-border bg-card/70 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Cpu className="size-3.5" /> CPU & Memory
          </div>
          <UsageAreaChart height={132} />
        </div>
        <div className="space-y-3 rounded-3xl border border-glass-border bg-card/70 p-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <MemoryStick className="size-3.5" /> Allocation
          </div>
          <Bar label="atlas-edge-01" value={62} delay={0.2} />
          <Bar label="helios-compute-a" value={81} delay={0.35} />
          <Bar label="nimbus-worker-01" value={37} delay={0.5} />
          <Bar label="pulsar-ml-01" value={88} delay={0.65} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Server, label: "Running VMs", value: "12" },
          { icon: Activity, label: "Active tasks", value: "17" },
          { icon: Cpu, label: "Fleet CPU", value: "58%" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="rounded-2xl border border-glass-border bg-card/70 px-4 py-3"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          >
            <s.icon className="size-4 text-primary" />
            <div className="mt-2 text-lg font-semibold tracking-tight">{s.value}</div>
            <div className="text-[11px] text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-glass-border bg-card/70 p-4">
        <div className="text-xs font-medium text-muted-foreground">Scheduler · Least Loaded</div>
        <div className="mt-3 flex items-center gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="h-8 flex-1 rounded-lg bg-primary/15"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 2.6, repeat: Infinity, delay: i * 0.16, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}