
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  checkAutoScaling,
  getAutoScalingConfig,
  updateAutoScalingConfig,
} from "@/lib/api";
import type {
  AutoScalingCandidate,
  AutoScalingConfig,
} from "@/lib/api";

export const Route = createFileRoute(
  "/_authenticated/os/autoscaling",
)({
  head: () => ({
    meta: [
      { title: "Auto-Scaling | CloudOS" },
      {
        name: "description",
        content: "Configure automatic CPU resource scaling.",
      },
    ],
  }),
  component: AutoScalingPage,
});

function AutoScalingPage() {
  const [config, setConfig] = useState<AutoScalingConfig | null>(null);
  const [candidates, setCandidates] = useState<AutoScalingCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadConfig() {
    try {
      setError("");
      const data = await getAutoScalingConfig();
      setConfig(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load auto-scaling configuration.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadConfig();
  }, []);

  async function saveConfig() {
    if (!config) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updated = await updateAutoScalingConfig({
        enabled: config.enabled,
        cpu_threshold: config.cpu_threshold,
        scale_up_cpu: config.scale_up_cpu,
        cooldown_seconds: config.cooldown_seconds,
      });

      setConfig(updated);
      setMessage("Auto-scaling settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function checkCandidates() {
    try {
      setChecking(true);
      setError("");
      setMessage("");

      const result = await checkAutoScaling();
      setCandidates(result.candidates);

      setMessage(
        result.enabled
          ? `${result.count} eligible VM(s) found.`
          : "Auto-scaling is disabled. Enable it to allow automatic scaling.",
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to check VMs.",
      );
    } finally {
      setChecking(false);
    }
  }

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading auto-scaling settings...</div>;
  }

  if (!config) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Auto-Scaling</h1>
        <p className="text-sm text-destructive">
          {error || "Configuration could not be loaded."}
        </p>
        <button
          onClick={() => void loadConfig()}
          className="rounded-lg border px-4 py-2 text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">CloudOS / Resources</p>
        <h1 className="mt-1 text-3xl font-semibold">Auto-Scaling</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Automatically increase CPU allocation when a running VM
          consistently exceeds your configured CPU threshold.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="rounded-lg border p-3 text-sm">
          {message}
        </p>
      )}

      <section className="space-y-5 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Scaling configuration</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Configure when and how CPU resources are increased.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(event) =>
                setConfig({ ...config, enabled: event.target.checked })
              }
            />
            Enable auto-scaling
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-2 text-sm">
            <span className="block font-medium">CPU threshold (%)</span>
            <input
              type="number"
              min={10}
              max={95}
              value={config.cpu_threshold}
              onChange={(event) =>
                setConfig({
                  ...config,
                  cpu_threshold: Number(event.target.value),
                })
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
            <span className="block text-xs text-muted-foreground">
              Valid range: 10–95%
            </span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="block font-medium">CPU increase (cores)</span>
            <input
              type="number"
              min={1}
              max={4}
              value={config.scale_up_cpu}
              onChange={(event) =>
                setConfig({
                  ...config,
                  scale_up_cpu: Number(event.target.value),
                })
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
            <span className="block text-xs text-muted-foreground">
              Valid range: 1–4 cores per scaling action
            </span>
          </label>

          <label className="space-y-2 text-sm">
            <span className="block font-medium">Cooldown (seconds)</span>
            <input
              type="number"
              min={30}
              max={3600}
              value={config.cooldown_seconds}
              onChange={(event) =>
                setConfig({
                  ...config,
                  cooldown_seconds: Number(event.target.value),
                })
              }
              className="w-full rounded-lg border bg-background px-3 py-2"
            />
            <span className="block text-xs text-muted-foreground">
              Valid range: 30–3600 seconds
            </span>
          </label>
        </div>

        <button
          onClick={() => void saveConfig()}
          disabled={saving}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save configuration"}
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Scaling candidates</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              VMs identified by the backend as eligible for scaling.
            </p>
          </div>

          <button
            onClick={() => void checkCandidates()}
            disabled={checking}
            className="rounded-lg border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check VMs"}
          </button>
        </div>

        {candidates.length === 0 ? (
          <div className="rounded-xl border border-dashed p-8 text-center">
            <p className="font-medium">No scaling candidates found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Run a check to see whether any VMs qualify for scaling.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="p-3">VM</th>
                  <th className="p-3">Current CPU</th>
                  <th className="p-3">Threshold</th>
                  <th className="p-3">Allocated CPU</th>
                  <th className="p-3">CPU increase</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((vm) => (
                  <tr key={vm.vm_id} className="border-b last:border-0">
                    <td className="p-3 font-medium">{vm.vm_name}</td>
                    <td className="p-3">
                      {vm.current_cpu_percent.toFixed(1)}%
                    </td>
                    <td className="p-3">{vm.cpu_threshold}%</td>
                    <td className="p-3">{vm.allocated_cpu} cores</td>
                    <td className="p-3">+{vm.scale_up_cpu} cores</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs text-muted-foreground">
        Automatic scaling is handled by the backend worker. Checking candidates
        only retrieves the current eligibility results; it does not trigger a
        manual scaling action.
      </p>
    </div>
  );
}
