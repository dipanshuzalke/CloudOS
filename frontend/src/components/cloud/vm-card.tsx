import { motion } from "motion/react";
import {
  Globe,
  HardDrive,
  MonitorCog,
  Wifi,
} from "lucide-react";

import type { VirtualMachine } from "@/features/cloud/data";


const statusStyles: Record<
  VirtualMachine["status"],
  {
    dot: string;
    label: string;
  }
> = {
  running: {
    dot: "bg-success",
    label: "Running",
  },

  stopped: {
    dot: "bg-muted-foreground",
    label: "Stopped",
  },

  provisioning: {
    dot: "bg-primary",
    label: "Provisioning",
  },

  degraded: {
    dot: "bg-warning",
    label: "Degraded",
  },
};


export function VMCard({
  vm,
  actions = false,
  onDelete,
}: {
  vm: VirtualMachine;
  actions?: boolean;
  onDelete?: (id: string) => void;
}) {

  const s = statusStyles[vm.status];


  return (
    <div className="glass-panel lift h-full rounded-[26px] p-6">

      <div className="flex items-start justify-between gap-3">

        <div>

          <div className="font-mono text-[15px] font-semibold">
            {vm.name}
          </div>

          <div className="mt-1 text-[12px] text-muted-foreground">
            Uptime {vm.uptime ?? "—"}
          </div>

        </div>


        <span className="inline-flex items-center gap-2 rounded-full border border-glass-border px-3 py-1 text-[12px]">

          <motion.span
            className={`size-1.5 rounded-full ${s.dot}`}
            animate={{
              opacity: [1, 0.35, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {s.label}

        </span>

      </div>


      <div className="mt-6 space-y-3.5">

        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>CPU Allocation</span>
          <span className="tabular-nums">
            {vm.cpu} core{vm.cpu !== 1 ? "s" : ""}
          </span>
        </div>


        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>Memory Allocation</span>
          <span className="tabular-nums">
            {vm.ram} MB
          </span>
        </div>


        <div className="flex justify-between text-[12px] text-muted-foreground">
          <span>Storage Allocation</span>
          <span className="tabular-nums">
            {vm.storage} GB
          </span>
        </div>

      </div>


      <div className="mt-6 grid grid-cols-2 gap-3 text-[12.5px] text-muted-foreground">

        <span className="inline-flex items-center gap-2">
          <MonitorCog className="size-3.5" />
          {vm.os ?? "—"}
        </span>


        <span className="inline-flex items-center gap-2">
          <Globe className="size-3.5" />
          {vm.region ?? "Local"}
        </span>


        <span className="inline-flex items-center gap-2">
          <Wifi className="size-3.5" />
          {vm.ip ?? "Not assigned"}
        </span>


        <span className="inline-flex items-center gap-2">
          <HardDrive className="size-3.5" />
          {vm.storage} GB
        </span>

      </div>


      {actions && (

        <div className="mt-6 flex flex-wrap gap-2">

          <button
            type="button"
            className="rounded-full border border-glass-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            Start
          </button>


          <button
            type="button"
            className="rounded-full border border-glass-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            Stop
          </button>


          <button
            type="button"
            className="rounded-full border border-glass-border px-4 py-2 text-[13px] font-medium transition-colors hover:bg-muted"
          >
            Restart
          </button>


          <button
            type="button"
            onClick={() => onDelete?.(vm.id)}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Delete
          </button>

        </div>

      )}

    </div>
  );
}