import { motion } from "motion/react";
import { Globe, HardDrive, MonitorCog, Wifi } from "lucide-react";
import type { VirtualMachine } from "@/features/cloud/data";

const statusStyles: Record<VirtualMachine["status"], { dot: string; label: string }> = {
  running: { dot: "bg-success", label: "Running" },
  stopped: { dot: "bg-muted-foreground", label: "Stopped" },
  provisioning: { dot: "bg-primary", label: "Provisioning" },
  degraded: { dot: "bg-warning", label: "Degraded" },
};

function Meter({ label, value, delay }: { label: string; value: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[12px] text-muted-foreground">
        <span>{label}</span>
        <span className="tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary/75"
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

export function VMCard({ vm, actions = false }: { vm: VirtualMachine; actions?: boolean }) {
  const s = statusStyles[vm.status];
  return (
    <div className="glass-panel lift h-full rounded-[26px] p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-mono text-[15px] font-semibold">{vm.name}</div>
          <div className="mt-1 text-[12px] text-muted-foreground">Uptime {vm.uptime}</div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-glass-border px-3 py-1 text-[12px]">
          <motion.span
            className={`size-1.5 rounded-full ${s.dot}`}
            animate={{ opacity: [1, 0.35, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          {s.label}
        </span>
      </div>

      <div className="mt-6 space-y-3.5">
        <Meter label="CPU" value={vm.cpu} delay={0.1} />
        <Meter label="Memory" value={vm.ram} delay={0.2} />
        <Meter label="Storage" value={vm.storage} delay={0.3} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 text-[12.5px] text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <MonitorCog className="size-3.5" /> {vm.os}
        </span>
        <span className="inline-flex items-center gap-2">
          <Globe className="size-3.5" /> {vm.region}
        </span>
        <span className="inline-flex items-center gap-2">
          <Wifi className="size-3.5" /> {vm.ip}
        </span>
        <span className="inline-flex items-center gap-2">
          <HardDrive className="size-3.5" /> {vm.storage * 8} GB
        </span>
      </div>

      {actions && (
        <div className="mt-6 flex flex-wrap gap-2">
          {["Start", "Stop", "Restart"].map((b) => (
            <button
              key={b}
              className="rounded-full border border-glass-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
            >
              {b}
            </button>
          ))}
          <button className="rounded-full px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}