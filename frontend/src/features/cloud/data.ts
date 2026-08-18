export type VMStatus = "running" | "stopped" | "provisioning" | "degraded";

export interface VirtualMachine {
  id: string;
  name: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  storage: number;
  os: string;
  region: string;
  ip: string;
  uptime: string;
}

export const virtualMachines: VirtualMachine[] = [
  { id: "vm-01", name: "atlas-edge-01", status: "running", cpu: 62, ram: 48, storage: 71, os: "Ubuntu 22.04 LTS", region: "us-east-1", ip: "10.24.8.11", uptime: "18d 04h" },
  { id: "vm-02", name: "atlas-edge-02", status: "running", cpu: 44, ram: 39, storage: 52, os: "Ubuntu 22.04 LTS", region: "us-east-1", ip: "10.24.8.12", uptime: "18d 04h" },
  { id: "vm-03", name: "helios-compute-a", status: "running", cpu: 81, ram: 74, storage: 63, os: "Debian 12", region: "eu-west-2", ip: "10.31.2.7", uptime: "9d 21h" },
  { id: "vm-04", name: "helios-compute-b", status: "degraded", cpu: 93, ram: 88, storage: 79, os: "Debian 12", region: "eu-west-2", ip: "10.31.2.8", uptime: "9d 21h" },
  { id: "vm-05", name: "nimbus-worker-01", status: "running", cpu: 37, ram: 41, storage: 34, os: "Alpine 3.19", region: "ap-south-1", ip: "10.44.6.21", uptime: "31d 12h" },
  { id: "vm-06", name: "nimbus-worker-02", status: "running", cpu: 29, ram: 33, storage: 30, os: "Alpine 3.19", region: "ap-south-1", ip: "10.44.6.22", uptime: "31d 12h" },
  { id: "vm-07", name: "orion-batch-01", status: "provisioning", cpu: 12, ram: 18, storage: 22, os: "Rocky Linux 9", region: "us-west-2", ip: "10.12.9.4", uptime: "—" },
  { id: "vm-08", name: "orion-batch-02", status: "running", cpu: 58, ram: 52, storage: 44, os: "Rocky Linux 9", region: "us-west-2", ip: "10.12.9.5", uptime: "4d 07h" },
  { id: "vm-09", name: "vega-stream-01", status: "running", cpu: 67, ram: 61, storage: 58, os: "Ubuntu 24.04 LTS", region: "eu-central-1", ip: "10.58.3.16", uptime: "12d 03h" },
  { id: "vm-10", name: "vega-stream-02", status: "stopped", cpu: 0, ram: 0, storage: 41, os: "Ubuntu 24.04 LTS", region: "eu-central-1", ip: "10.58.3.17", uptime: "—" },
  { id: "vm-11", name: "lyra-cache-01", status: "running", cpu: 51, ram: 69, storage: 26, os: "Ubuntu 22.04 LTS", region: "us-east-1", ip: "10.24.8.31", uptime: "22d 18h" },
  { id: "vm-12", name: "pulsar-ml-01", status: "running", cpu: 88, ram: 79, storage: 84, os: "Ubuntu 22.04 LTS", region: "us-west-2", ip: "10.12.9.44", uptime: "6d 15h" },
];

export type TaskState = "running" | "queued" | "completed" | "failed";

export interface CloudTask {
  id: string;
  name: string;
  state: TaskState;
  progress: number;
  cpu: number;
  ram: number;
  eta: string;
  vm: string;
}

export const tasks: CloudTask[] = [
  { id: "t-1042", name: "image-transcode-batch", state: "running", progress: 68, cpu: 2.4, ram: 3.2, eta: "4m 12s", vm: "atlas-edge-01" },
  { id: "t-1043", name: "nightly-index-rebuild", state: "running", progress: 41, cpu: 1.8, ram: 2.1, eta: "11m 40s", vm: "helios-compute-a" },
  { id: "t-1044", name: "ml-feature-extraction", state: "running", progress: 87, cpu: 3.6, ram: 6.4, eta: "1m 58s", vm: "pulsar-ml-01" },
  { id: "t-1045", name: "log-compaction-eu", state: "running", progress: 23, cpu: 1.1, ram: 1.4, eta: "17m 05s", vm: "vega-stream-01" },
  { id: "t-1046", name: "checkout-load-simulation", state: "queued", progress: 0, cpu: 2.0, ram: 2.6, eta: "queued", vm: "unassigned" },
  { id: "t-1047", name: "cdn-cache-warmup", state: "queued", progress: 0, cpu: 0.8, ram: 1.0, eta: "queued", vm: "unassigned" },
  { id: "t-1048", name: "postgres-vacuum-analyze", state: "queued", progress: 0, cpu: 1.4, ram: 2.2, eta: "queued", vm: "unassigned" },
  { id: "t-1049", name: "weekly-report-render", state: "completed", progress: 100, cpu: 1.2, ram: 1.6, eta: "done", vm: "nimbus-worker-01" },
  { id: "t-1050", name: "snapshot-replication", state: "completed", progress: 100, cpu: 2.2, ram: 2.8, eta: "done", vm: "orion-batch-02" },
  { id: "t-1051", name: "container-image-scan", state: "completed", progress: 100, cpu: 0.9, ram: 1.1, eta: "done", vm: "nimbus-worker-02" },
  { id: "t-1052", name: "geo-shard-rebalance", state: "failed", progress: 62, cpu: 3.1, ram: 4.0, eta: "aborted", vm: "helios-compute-b" },
  { id: "t-1053", name: "billing-aggregation", state: "failed", progress: 34, cpu: 1.6, ram: 2.4, eta: "aborted", vm: "lyra-cache-01" },
];

export interface Algorithm {
  id: string;
  name: string;
  tagline: string;
  description: string;
  advantages: string[];
  disadvantages: string[];
  complexity: string;
  fairness: number;
  throughput: number;
  utilization: number;
}

export const algorithms: Algorithm[] = [
  {
    id: "round-robin",
    name: "Round Robin",
    tagline: "Equal turns, predictable rhythm",
    description:
      "Tasks are dispatched to virtual machines in a repeating cycle, giving every node an identical share of incoming workload regardless of its current pressure.",
    advantages: ["Perfectly fair distribution", "Constant-time decisions", "Trivial to reason about"],
    disadvantages: ["Ignores real node load", "Weak with uneven task sizes"],
    complexity: "O(1)",
    fairness: 96,
    throughput: 72,
    utilization: 64,
  },
  {
    id: "least-loaded",
    name: "Least Loaded",
    tagline: "Always feed the quietest node",
    description:
      "Every dispatch inspects live CPU and memory pressure across the fleet and places the task on the machine with the most available headroom.",
    advantages: ["Excellent utilization balance", "Adapts to live pressure", "Reduces hotspots"],
    disadvantages: ["Requires continuous telemetry", "Costlier scheduling pass"],
    complexity: "O(n)",
    fairness: 81,
    throughput: 90,
    utilization: 93,
  },
  {
    id: "best-fit",
    name: "Best Fit",
    tagline: "The tightest possible packing",
    description:
      "Selects the node whose remaining capacity most closely matches the request, minimising leftover fragments across the cluster.",
    advantages: ["Minimal resource fragmentation", "High density packing", "Lower fleet cost"],
    disadvantages: ["Leaves fragile slivers of capacity", "Slower placement search"],
    complexity: "O(n log n)",
    fairness: 68,
    throughput: 84,
    utilization: 88,
  },
  {
    id: "first-fit",
    name: "First Fit",
    tagline: "The fastest good-enough answer",
    description:
      "Scans the fleet in order and commits to the first machine that can host the workload, trading optimality for scheduling speed.",
    advantages: ["Very fast placement", "Low scheduler overhead", "Great for burst traffic"],
    disadvantages: ["Front nodes saturate first", "Suboptimal long-run balance"],
    complexity: "O(n) worst case",
    fairness: 59,
    throughput: 88,
    utilization: 71,
  },
];

export const cpuSeries = [
  { t: "00:00", cpu: 34, mem: 28, net: 62 },
  { t: "03:00", cpu: 41, mem: 33, net: 71 },
  { t: "06:00", cpu: 38, mem: 36, net: 68 },
  { t: "09:00", cpu: 57, mem: 44, net: 96 },
  { t: "12:00", cpu: 72, mem: 52, net: 118 },
  { t: "15:00", cpu: 64, mem: 49, net: 125 },
  { t: "18:00", cpu: 58, mem: 41, net: 109 },
  { t: "21:00", cpu: 46, mem: 37, net: 84 },
];

export const weeklyUsage = [
  { day: "Mon", compute: 62, storage: 48 },
  { day: "Tue", compute: 71, storage: 52 },
  { day: "Wed", compute: 66, storage: 55 },
  { day: "Thu", compute: 78, storage: 58 },
  { day: "Fri", compute: 84, storage: 61 },
  { day: "Sat", compute: 49, storage: 44 },
  { day: "Sun", compute: 41, storage: 40 },
];

export const taskDistribution = [
  { name: "Running", value: 17, key: "running" },
  { name: "Queued", value: 9, key: "queued" },
  { name: "Completed", value: 128, key: "completed" },
  { name: "Failed", value: 4, key: "failed" },
];

export const algorithmComparison = algorithms.map((a) => ({
  name: a.name,
  utilization: a.utilization,
  throughput: a.throughput,
  fairness: a.fairness,
}));

export const activity = [
  { title: "Auto scaling event", detail: "Fleet expanded from 10 → 12 nodes in us-east-1", time: "2m ago", kind: "scale" as const },
  { title: "Task started", detail: "ml-feature-extraction dispatched to pulsar-ml-01", time: "9m ago", kind: "task" as const },
  { title: "CPU alert", detail: "helios-compute-b sustained 93% for 5 minutes", time: "24m ago", kind: "alert" as const },
  { title: "Scheduler updated", detail: "Policy switched to Least Loaded", time: "1h ago", kind: "scheduler" as const },
  { title: "VM created", detail: "orion-batch-01 provisioned in us-west-2", time: "3h ago", kind: "vm" as const },
];

export const kpis = [
  { label: "Running VMs", value: 12, suffix: "", hint: "across 5 regions" },
  { label: "CPU", value: 58, suffix: "%", hint: "fleet average" },
  { label: "Memory", value: 41, suffix: "%", hint: "of 384 GB" },
  { label: "Tasks", value: 17, suffix: "", hint: "active workloads" },
  { label: "Storage", value: 620, suffix: "GB", hint: "provisioned" },
  { label: "Network", value: 125, suffix: "Mbps", hint: "egress now" },
];