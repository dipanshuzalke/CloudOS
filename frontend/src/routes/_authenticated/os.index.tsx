import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  Loader2,
  MemoryStick,
  Network,
  Plus,
  Rocket,
  Scale,
  Server,
  Timer,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/os/shell";
import { Counter, Reveal } from "@/components/motion/reveal";
import {
  NetworkLineChart,
  TaskDonutChart,
  UsageAreaChart,
  WeeklyBarChart,
} from "@/components/cloud/charts";

import {
  getComputeNodes,
  getScheduler,
  getTasks,
  getVMs,
  type ComputeNodeFromAPI,
  type SchedulerResponse,
  type TaskFromAPI,
  type VMFromAPI,
} from "@/lib/api";

export const Route = createFileRoute("/_authenticated/os/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Cloud OS" },
      {
        name: "description",
        content:
          "Live CloudOS infrastructure, resource allocation and workload overview.",
      },
      { property: "og:title", content: "Dashboard — Cloud OS" },
      {
        property: "og:description",
        content:
          "Monitor live virtual machines, compute resources and workloads.",
      },
    ],
  }),
  component: DashboardPage,
});

const quickActions = [
  { icon: Plus, label: "Create VM" },
  { icon: Timer, label: "Create Task" },
  { icon: Scale, label: "Open Scheduler" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Rocket, label: "Deploy Workload" },
];

function DashboardPage() {
  const [vms, setVMs] = useState<VMFromAPI[]>([]);
  const [tasks, setTasks] = useState<TaskFromAPI[]>([]);
  const [nodes, setNodes] = useState<ComputeNodeFromAPI[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const [vmData, taskData, nodeData, schedulerData] =
          await Promise.all([
            getVMs(),
            getTasks(),
            getComputeNodes(),
            getScheduler(),
          ]);

        setVMs(vmData);
        setTasks(taskData);
        setNodes(nodeData);
        setScheduler(schedulerData);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        setError("Failed to load live dashboard data.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  /* =========================================================
     LIVE RESOURCE CALCULATIONS
  ========================================================= */

  const resourceStats = useMemo(() => {
    const totalCPU = nodes.reduce(
      (sum, node) => sum + node.total_cpu,
      0,
    );

    const allocatedCPU = nodes.reduce(
      (sum, node) => sum + node.allocated_cpu,
      0,
    );

    const totalRAM = nodes.reduce(
      (sum, node) => sum + node.total_ram,
      0,
    );

    const allocatedRAM = nodes.reduce(
      (sum, node) => sum + node.allocated_ram,
      0,
    );

    const totalStorage = nodes.reduce(
      (sum, node) => sum + node.total_storage,
      0,
    );

    const allocatedStorage = nodes.reduce(
      (sum, node) => sum + node.allocated_storage,
      0,
    );

    return {
      totalCPU,
      allocatedCPU,
      totalRAM,
      allocatedRAM,
      totalStorage,
      allocatedStorage,

      cpuPercentage:
        totalCPU > 0
          ? Math.round((allocatedCPU / totalCPU) * 100)
          : 0,

      ramPercentage:
        totalRAM > 0
          ? Math.round((allocatedRAM / totalRAM) * 100)
          : 0,

      storagePercentage:
        totalStorage > 0
          ? Math.round((allocatedStorage / totalStorage) * 100)
          : 0,
    };
  }, [nodes]);

  /* =========================================================
     LIVE VM COUNTS
  ========================================================= */

  const runningVMs = useMemo(
    () =>
      vms.filter(
        (vm) => vm.status.toLowerCase() === "running",
      ).length,
    [vms],
  );

  /* =========================================================
     LIVE TASK COUNTS
  ========================================================= */

  const taskStats = useMemo(() => {
    const running = tasks.filter(
      (task) => task.status.toLowerCase() === "running",
    ).length;

    const queued = tasks.filter((task) => {
      const status = task.status.toLowerCase();

      return (
        status === "queued" ||
        status === "pending" ||
        status === "created"
      );
    }).length;

    const completed = tasks.filter(
      (task) => task.status.toLowerCase() === "completed",
    ).length;

    const failed = tasks.filter(
      (task) => task.status.toLowerCase() === "failed",
    ).length;

    return {
      total: tasks.length,
      running,
      queued,
      completed,
      failed,
    };
  }, [tasks]);

  /* =========================================================
     LIVE KPIs
  ========================================================= */

  const kpis = [
    {
      icon: Server,
      label: "Running VMs",
      value: runningVMs,
      suffix: "",
      hint: `${vms.length} total`,
    },
    {
      icon: Cpu,
      label: "CPU",
      value: resourceStats.cpuPercentage,
      suffix: "%",
      hint: `${resourceStats.allocatedCPU} / ${resourceStats.totalCPU} vCPU`,
    },
    {
      icon: MemoryStick,
      label: "Memory",
      value: resourceStats.ramPercentage,
      suffix: "%",
      hint: `${formatRam(resourceStats.allocatedRAM)} / ${formatRam(resourceStats.totalRAM)}`,
    },
    {
      icon: Activity,
      label: "Tasks",
      value: taskStats.total,
      suffix: "",
      hint: `${taskStats.queued} queued`,
    },
    {
      icon: HardDrive,
      label: "Storage",
      value: resourceStats.allocatedStorage,
      suffix: " GB",
      hint: `of ${resourceStats.totalStorage} GB`,
    },
    {
      icon: Network,
      label: "Compute Nodes",
      value: nodes.length,
      suffix: "",
      hint: `${nodes.filter((node) => node.status === "active").length} active`,
    },
  ];

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="space-y-10">
        <PageHeader
          title="Cloud Infrastructure Overview"
          subtitle="Loading live CloudOS infrastructure data."
        />

        <div className="glass-panel flex items-center justify-center rounded-[26px] p-12">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading live infrastructure...
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="space-y-10">
        <PageHeader
          title="Cloud Infrastructure Overview"
          subtitle="Monitor live CloudOS infrastructure and resource allocation."
        />

        <div className="rounded-[26px] border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      </div>
    );
  }

  /* =========================================================
     DASHBOARD
  ========================================================= */

  return (
    <div className="space-y-10">
      <PageHeader
        title="Cloud Infrastructure Overview"
        subtitle="Monitor live infrastructure, workloads and resource allocation."
      />

      {/* =====================================================
          LIVE KPIs
      ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kpis.map((k, i) => (
          <Reveal key={k.label} delay={i * 0.06}>
            <div className="glass-panel lift rounded-[26px] p-6">
              <div className="flex items-center justify-between">
                <k.icon className="size-4.5 text-primary" />

                <span className="text-[12px] text-muted-foreground">
                  {k.hint}
                </span>
              </div>

              <div className="mt-6 text-[2.25rem] leading-none font-semibold tracking-tight">
                <Counter
                  value={k.value}
                  suffix={k.suffix}
                />
              </div>

              <div className="mt-2 text-[14px] text-muted-foreground">
                {k.label}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* =====================================================
          RESOURCE OVERVIEW
      ===================================================== */}

      <section className="space-y-4">
        <div>
          <h2 className="text-[20px] font-semibold">
            Compute resource allocation
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current CPU, memory and storage allocation across the
            CloudOS compute fleet.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <ResourceOverviewCard
            icon={<Cpu className="size-4" />}
            label="CPU"
            allocated={`${resourceStats.allocatedCPU} vCPU`}
            total={`${resourceStats.totalCPU} vCPU`}
            percentage={resourceStats.cpuPercentage}
          />

          <ResourceOverviewCard
            icon={<MemoryStick className="size-4" />}
            label="Memory"
            allocated={formatRam(resourceStats.allocatedRAM)}
            total={formatRam(resourceStats.totalRAM)}
            percentage={resourceStats.ramPercentage}
          />

          <ResourceOverviewCard
            icon={<HardDrive className="size-4" />}
            label="Storage"
            allocated={`${resourceStats.allocatedStorage} GB`}
            total={`${resourceStats.totalStorage} GB`}
            percentage={resourceStats.storagePercentage}
          />
        </div>
      </section>

      {/* =====================================================
          EXISTING CHART AREA
      ===================================================== */}

      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">
              CPU & memory utilisation
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Historical telemetry is not connected yet.
            </div>

            <UsageAreaChart height={250} />
          </div>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="glass-panel h-full rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">
              Task distribution
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Live task counts
            </div>

            <TaskDistribution
              running={taskStats.running}
              queued={taskStats.queued}
              completed={taskStats.completed}
              failed={taskStats.failed}
            />
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">
              Weekly usage
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Historical usage is not connected yet.
            </div>

            <WeeklyBarChart height={210} />
          </div>
        </Reveal>

        <Reveal
          delay={0.14}
          className="lg:col-span-2"
        >
          <div className="glass-panel rounded-[26px] p-6">
            <div className="text-[15px] font-semibold">
              Network throughput
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Runtime network telemetry is not connected yet.
            </div>

            <NetworkLineChart height={210} />
          </div>
        </Reveal>
      </div>

      {/* =====================================================
          ACTIVE SCHEDULER
      ===================================================== */}

      {scheduler && (
        <section className="space-y-4">
          <div>
            <h2 className="text-[20px] font-semibold">
              Active Scheduler
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Global scheduling policy currently used for VM placement.
            </p>
          </div>

          <div className="glass-panel lift rounded-[26px] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
                  <Scale className="size-5 text-primary" />
                </div>

                <div>
                  <div className="text-lg font-semibold">
                    {formatAlgorithm(scheduler.algorithm)}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Global placement policy
                  </div>
                </div>
              </div>

              <div className="rounded-full border border-glass-border px-3 py-1 text-xs text-muted-foreground">
                {scheduler.available_algorithms.length} algorithms available
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          COMPUTE NODES
      ===================================================== */}

      <section className="space-y-4">
        <div>
          <h2 className="text-[20px] font-semibold">
            Compute nodes
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Current resource allocation across logical CloudOS compute nodes.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {nodes.map((node, i) => (
            <Reveal
              key={node.id}
              delay={i * 0.05}
            >
              <ComputeNodeCard node={node} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* =====================================================
          QUICK ACTIONS
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">
          Quick actions
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {quickActions.map((a, i) => (
            <Reveal
              key={a.label}
              delay={i * 0.05}
            >
              <button
                type="button"
                className="glass-panel lift flex w-full items-center gap-3 rounded-[22px] px-5 py-5 text-left text-[15px] font-medium"
              >
                <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft">
                  <a.icon className="size-4.5 text-primary" />
                </span>

                {a.label}
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* =====================================================
          EXISTING RECENT ACTIVITY
      ===================================================== */}

      <section className="space-y-4">
        <h2 className="text-[20px] font-semibold">
          Recent activity
        </h2>

        <div className="glass-panel rounded-[26px] p-7">
          <div className="text-sm text-muted-foreground">
            Activity history will be connected to backend events later.
          </div>
        </div>
      </section>
    </div>
  );
}

/* =========================================================
   RESOURCE CARD
========================================================= */

function ResourceOverviewCard({
  icon,
  label,
  allocated,
  total,
  percentage,
}: {
  icon: React.ReactNode;
  label: string;
  allocated: string;
  total: string;
  percentage: number;
}) {
  return (
    <div className="glass-panel rounded-[26px] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          {label}
        </div>

        <span className="text-sm font-semibold">
          {percentage}%
        </span>
      </div>

      <div className="mt-5 text-xl font-semibold">
        {allocated}
      </div>

      <div className="mt-1 text-xs text-muted-foreground">
        of {total} allocated
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${Math.min(100, percentage)}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   COMPUTE NODE CARD
========================================================= */

function ComputeNodeCard({
  node,
}: {
  node: ComputeNodeFromAPI;
}) {
  const cpuPercentage = getPercentage(
    node.allocated_cpu,
    node.total_cpu,
  );

  const ramPercentage = getPercentage(
    node.allocated_ram,
    node.total_ram,
  );

  const storagePercentage = getPercentage(
    node.allocated_storage,
    node.total_storage,
  );

  return (
    <div className="glass-panel lift rounded-[26px] p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <Server className="size-4.5 text-primary" />
          </div>

          <div>
            <div className="font-semibold">
              {node.name}
            </div>

            <div className="mt-1 text-xs text-muted-foreground">
              Node #{node.id}
            </div>
          </div>
        </div>

        <span className="rounded-full border border-glass-border px-3 py-1 text-xs">
          {node.status}
        </span>
      </div>

      <div className="mt-6 space-y-4">
        <NodeResourceBar
          label="CPU"
          allocated={`${node.allocated_cpu} / ${node.total_cpu} vCPU`}
          percentage={cpuPercentage}
        />

        <NodeResourceBar
          label="Memory"
          allocated={`${formatRam(node.allocated_ram)} / ${formatRam(node.total_ram)}`}
          percentage={ramPercentage}
        />

        <NodeResourceBar
          label="Storage"
          allocated={`${node.allocated_storage} / ${node.total_storage} GB`}
          percentage={storagePercentage}
        />
      </div>
    </div>
  );
}

/* =========================================================
   NODE RESOURCE BAR
========================================================= */

function NodeResourceBar({
  label,
  allocated,
  percentage,
}: {
  label: string;
  allocated: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {label}
        </span>

        <span className="font-medium">
          {allocated}
        </span>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-primary/10">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{
            width: `${Math.min(100, percentage)}%`,
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   TASK DISTRIBUTION
========================================================= */

function TaskDistribution({
  running,
  queued,
  completed,
  failed,
}: {
  running: number;
  queued: number;
  completed: number;
  failed: number;
}) {
  const total = running + queued + completed + failed;

  const items = [
    {
      label: "Running",
      value: running,
      className: "bg-primary",
    },
    {
      label: "Queued",
      value: queued,
      className: "bg-muted-foreground",
    },
    {
      label: "Completed",
      value: completed,
      className: "bg-success",
    },
    {
      label: "Failed",
      value: failed,
      className: "bg-destructive",
    },
  ];

  return (
    <div className="mt-5 space-y-4">
      {items.map((item) => {
        const percentage =
          total > 0
            ? Math.round((item.value / total) * 100)
            : 0;

        return (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${item.className}`}
                />

                <span className="text-muted-foreground">
                  {item.label}
                </span>
              </div>

              <span className="font-medium">
                {item.value}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${item.className}`}
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function getPercentage(
  allocated: number,
  total: number,
) {
  if (total <= 0) return 0;

  return Math.round(
    (allocated / total) * 100,
  );
}

function formatRam(ram: number) {
  if (ram >= 1024) {
    return `${(ram / 1024).toFixed(1)} GB`;
  }

  return `${ram} MB`;
}

function formatAlgorithm(algorithm: string) {
  return algorithm
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}