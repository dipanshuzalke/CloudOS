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
import { useEffect, useState } from "react";
import { getVMMonitoring, type VMMetricFromAPI } from "@/lib/api";
import { useTasks } from "@/features/cloud/hooks";
import { getComputeNodes } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/os/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Cloud OS" },
      {
        name: "description",
        content:
          "CPU, memory, network, task success, resource allocation and scheduling policy comparison charts.",
      },
      { property: "og:title", content: "Analytics — Cloud OS" },
      {
        property: "og:description",
        content: "Deep performance analytics for the simulated cloud fleet.",
      },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const [metrics, setMetrics] = useState<VMMetricFromAPI[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const { data: tasks = [] } = useTasks();
  const [nodes, setNodes] = useState<Awaited<ReturnType<typeof getComputeNodes>>>([]);

  const taskDistribution = [
    {
      name: "Running",
      value: tasks.filter((task) => task.status.toLowerCase() === "running").length,
    },
    {
      name: "Queued",
      value: tasks.filter((task) => {
        const status = task.status.toLowerCase();
        return status === "queued" || status === "pending" || status === "created";
      }).length,
    },
    {
      name: "Completed",
      value: tasks.filter((task) => task.status.toLowerCase() === "completed").length,
    },
    {
      name: "Failed",
      value: tasks.filter((task) => task.status.toLowerCase() === "failed").length,
    },
  ];

  useEffect(() => {
  let cancelled = false;

  async function loadAnalyticsData() {
    try {
      setLoadingMetrics(true);

      const [monitoringData, nodeData] = await Promise.all([
        getVMMonitoring(24),
        getComputeNodes(),
      ]);

      if (!cancelled) {
        setMetrics(monitoringData);
        setNodes(nodeData);
      }
    } catch (error) {
      console.error("Failed to load analytics data:", error);
    } finally {
      if (!cancelled) {
        setLoadingMetrics(false);
      }
    }
  }

  loadAnalyticsData();

  const interval = window.setInterval(() => {
    loadAnalyticsData();
  }, 30_000);

  return () => {
    cancelled = true;
    window.clearInterval(interval);
  };
}, []);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((task) => task.status.toLowerCase() === "completed").length;

  const failedTasks = tasks.filter((task) => task.status.toLowerCase() === "failed").length;

  const runningTasks = tasks.filter((task) => task.status.toLowerCase() === "running").length;

  const taskSuccessRate =
    completedTasks + failedTasks > 0 ? (completedTasks / (completedTasks + failedTasks)) * 100 : 0;

  const totalCPU = nodes.reduce((sum, node) => sum + node.total_cpu, 0);

  const allocatedCPU = nodes.reduce((sum, node) => sum + node.allocated_cpu, 0);

  const fleetEfficiency = totalCPU > 0 ? (allocatedCPU / totalCPU) * 100 : 0;

  const summary = [
    {
      label: "Task success rate",
      value: taskSuccessRate,
      suffix: "%",
      decimals: 1,
    },
    {
      label: "Total tasks",
      value: totalTasks,
      suffix: "",
      decimals: 0,
    },
    {
      label: "Running tasks",
      value: runningTasks,
      suffix: "",
      decimals: 0,
    },
    {
      label: "Fleet efficiency",
      value: fleetEfficiency,
      suffix: "%",
      decimals: 1,
    },
  ];

  const monitoringChartData = metrics.map((metric, index) => {
    const previous = metrics[index - 1];

    let networkMbps = 0;

    if (previous) {
      const currentBytes = metric.network_rx_bytes + metric.network_tx_bytes;

      const previousBytes = previous.network_rx_bytes + previous.network_tx_bytes;

      const byteDelta = Math.max(0, currentBytes - previousBytes);

      const currentTime = new Date(metric.recorded_at).getTime();

      const previousTime = new Date(previous.recorded_at).getTime();

      const seconds = Math.max(1, currentTime - previousTime) / 1000;

      networkMbps = (byteDelta * 8) / seconds / (1024 * 1024);
    }

    return {
      t: new Date(metric.recorded_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cpu: Number(metric.cpu_percent.toFixed(2)),
      mem: Number(metric.memory_percent.toFixed(2)),
      net: Number(networkMbps.toFixed(2)),
    };
  });

  const resourceAllocationData = [
    {
      resource: "CPU",
      allocated: nodes.reduce((sum, node) => sum + node.allocated_cpu, 0),
      available: nodes.reduce((sum, node) => sum + node.available_cpu, 0),
    },
    {
      resource: "Memory",
      allocated: nodes.reduce((sum, node) => sum + node.allocated_ram, 0),
      available: nodes.reduce((sum, node) => sum + node.available_ram, 0),
    },
    {
      resource: "Storage",
      allocated: nodes.reduce((sum, node) => sum + node.allocated_storage, 0),
      available: nodes.reduce((sum, node) => sum + node.available_storage, 0),
    },
  ];
  return (
    <div className="space-y-9">
      <PageHeader
        title="Performance Analytics"
        subtitle="How the fleet behaves over time, and how each scheduling policy compares."
      />

      <div className="glass-panel rounded-[26px] p-6">
        <div className="text-[15px] font-semibold">Monitoring Samples</div>

        <div className="mt-2 text-sm text-muted-foreground">
          {loadingMetrics ? "Loading..." : `${metrics.length} monitoring samples loaded`}
        </div>
      </div>

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
            <UsageAreaChart height={280} data={monitoringChartData} />
          </div>
        </Reveal>
        <Reveal delay={0.06}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Network throughput</div>
            <NetworkLineChart height={240} data={monitoringChartData} />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Task outcomes</div>
            <TaskDonutChart height={240} data={taskDistribution} />
          </div>
        </Reveal>
        <Reveal delay={0.14}>
          <div className="glass-panel rounded-[26px] p-7">
            <div className="text-[15px] font-semibold">Current resource allocation</div>
            <WeeklyBarChart height={260} data={resourceAllocationData} />
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
