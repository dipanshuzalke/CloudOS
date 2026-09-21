import { useState, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { InlineSpinner } from "@/components/cloud/states";

import { useCreateTask, useCreateVM } from "@/features/cloud/hooks";

const operatingSystems = [
  {
    value: "ubuntu",
    label: "Ubuntu 22.04 LTS",
  },
  {
    value: "debian",
    label: "Debian 12",
  },
  {
    value: "alpine",
    label: "Alpine 3.20",
  },
  {
    value: "rocky",
    label: "Rocky Linux 9",
  },
];

const regions = ["us-east-1", "us-west-2", "eu-west-1", "ap-south-1"];

function Field({
  label,
  hint,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[13px] font-medium">{label}</span>

      <input
        {...props}
        className="w-full rounded-2xl border border-glass-border bg-card/60 px-4 py-3 text-[14.5px] outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
      />

      {hint && <span className="block text-[12px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

/* =========================================================
   CREATE VM
========================================================= */

export function CreateVMDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("Ubuntu Server");

  const [os, setOs] = useState("ubuntu");

  const [region, setRegion] = useState("us-east-1");

  const [cpu, setCpu] = useState(2);

  const [ram, setRam] = useState(2048);

  const [storage, setStorage] = useState(20);

  const create = useCreateVM();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await create.mutateAsync({
        name: name.trim(),
        os,
        region,
        cpu,
        ram,
        storage,
      });

      setOpen(false);
    } catch (error) {
      console.error("Failed to create VM:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="glass-panel rounded-[26px] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[20px]">Create virtual machine</DialogTitle>

          <DialogDescription>
            Configure the operating system, region, and resources for your VM.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 pt-2">
          {/* VM NAME */}

          <Field
            label="Name"
            value={name}
            required
            maxLength={120}
            placeholder="atlas-edge-01"
            onChange={(e) => setName(e.target.value)}
          />

          {/* OS + REGION */}

          <div className="grid grid-cols-2 gap-4">
            {/* OPERATING SYSTEM */}

            <label className="block space-y-2">
              <span className="text-[13px] font-medium">Operating System</span>

              <select
                value={os}
                onChange={(e) => setOs(e.target.value)}
                className="w-full rounded-2xl border border-glass-border bg-card/60 px-4 py-3 text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
              >
                {operatingSystems.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            {/* REGION */}

            <label className="block space-y-2">
              <span className="text-[13px] font-medium">Region</span>

              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-2xl border border-glass-border bg-card/60 px-4 py-3 text-[14px] outline-none transition-shadow focus:ring-2 focus:ring-primary/30"
              >
                {regions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* CPU + RAM */}

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="vCPU"
              type="number"
              min={1}
              max={16}
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
            />

            <Field
              label="Memory (MB)"
              type="number"
              min={64}
              max={32768}
              step={64}
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
            />
          </div>

          {/* STORAGE */}

          <Field
            label="Storage (GB)"
            type="number"
            min={1}
            max={1024}
            value={storage}
            hint="CPU and memory limits are enforced by Docker when the VM is provisioned."
            onChange={(e) => setStorage(Number(e.target.value))}
          />

          {/* CREATE */}

          <DialogFooter className="pt-2">
            <button
              type="submit"
              disabled={create.isPending || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {create.isPending && <InlineSpinner />}

              {create.isPending ? "Creating…" : "Create VM"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* =========================================================
   CREATE TASK
========================================================= */

export function CreateTaskDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("CPU Benchmark");

  const [cpu, setCpu] = useState(1);

  const [ram, setRam] = useState(512);

  const [storage, setStorage] = useState(10);

  const create = useCreateTask();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      await create.mutateAsync({
        name: name.trim(),
        cpu_required: cpu,
        ram_required: ram,
        storage_required: storage,
      });

      setOpen(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="glass-panel rounded-[26px] sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="text-[20px]">Create workload</DialogTitle>

          <DialogDescription>Add a workload to the cloud task database.</DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4 pt-2">
          <Field
            label="Name"
            value={name}
            required
            maxLength={120}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="vCPU required"
              type="number"
              min={1}
              max={16}
              value={cpu}
              onChange={(e) => setCpu(Number(e.target.value))}
            />

            <Field
              label="Memory required (MB)"
              type="number"
              min={64}
              max={32768}
              step={64}
              value={ram}
              onChange={(e) => setRam(Number(e.target.value))}
            />
          </div>
          <Field
            label="Storage required (GB)"
            type="number"
            min={1}
            max={1024}
            value={storage}
            hint="Storage is reserved on the compute node when the task is created."
            onChange={(e) => setStorage(Number(e.target.value))}
          />

          <DialogFooter className="pt-2">
            <button
              type="submit"
              disabled={create.isPending || !name.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {create.isPending && <InlineSpinner />}

              {create.isPending ? "Creating…" : "Create Task"}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
