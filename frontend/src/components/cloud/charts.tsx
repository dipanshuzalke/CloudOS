import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cpuSeries, taskDistribution, weeklyUsage, algorithmComparison } from "@/features/cloud/data";

const axis = {
  stroke: "var(--muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  contentStyle: {
    borderRadius: 16,
    border: "1px solid var(--glass-border)",
    background: "var(--card)",
    boxShadow: "var(--shadow-float)",
    fontSize: 12,
  },
} as const;

export function UsageAreaChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={cpuSeries} margin={{ left: -20, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="gCpu" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gMem" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} />
        <Area type="monotone" dataKey="cpu" stroke="var(--chart-1)" strokeWidth={2} fill="url(#gCpu)" animationDuration={1400} />
        <Area type="monotone" dataKey="mem" stroke="var(--chart-2)" strokeWidth={2} fill="url(#gMem)" animationDuration={1800} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function NetworkLineChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={cpuSeries} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="t" {...axis} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} />
        <Line type="monotone" dataKey="net" stroke="var(--chart-3)" strokeWidth={2.2} dot={false} animationDuration={1600} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeeklyBarChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={weeklyUsage} margin={{ left: -20, right: 8, top: 8 }}>
        <CartesianGrid strokeDasharray="3 6" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="day" {...axis} />
        <YAxis {...axis} width={44} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "var(--muted)" }} />
        <Bar dataKey="compute" radius={[8, 8, 8, 8]} fill="var(--chart-1)" animationDuration={1300} />
        <Bar dataKey="storage" radius={[8, 8, 8, 8]} fill="var(--chart-2)" animationDuration={1600} />
      </BarChart>
    </ResponsiveContainer>
  );
}

const pieColors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function TaskDonutChart({ height = 240 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip {...tooltipStyle} />
        <Pie
          data={taskDistribution}
          dataKey="value"
          nameKey="name"
          innerRadius="58%"
          outerRadius="82%"
          paddingAngle={3}
          stroke="none"
          animationDuration={1400}
        >
          {taskDistribution.map((_, i) => (
            <Cell key={i} fill={pieColors[i % pieColors.length]} />
          ))}
        </Pie>
        <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AlgorithmRadarChart({ height = 280 }: { height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={algorithmComparison} outerRadius="72%">
        <PolarGrid stroke="var(--border)" />
        <PolarAngleAxis dataKey="name" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
        <Tooltip {...tooltipStyle} />
        <Radar dataKey="utilization" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.22} animationDuration={1500} />
        <Radar dataKey="throughput" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.14} animationDuration={1800} />
      </RadarChart>
    </ResponsiveContainer>
  );
}