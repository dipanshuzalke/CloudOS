import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

export const Route = createFileRoute("/os/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Cloud OS" },
      { name: "description", content: "Appearance, language, notifications, scheduler defaults and resource limits for the simulator." },
      { property: "og:title", content: "Settings — Cloud OS" },
      { property: "og:description", content: "Tune the Cloud OS simulation environment." },
    ],
  }),
  component: SettingsPage,
});

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-2 pb-3 text-[12px] font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </div>
      <div className="glass-panel divide-y divide-border overflow-hidden rounded-[26px]">{children}</div>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-6 py-5">
      <div>
        <div className="text-[15px] font-medium">{label}</div>
        {hint ? <div className="mt-0.5 text-[13px] text-muted-foreground">{hint}</div> : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="max-w-3xl space-y-8">
      <PageHeader title="Settings" subtitle="Preferences for the simulation environment." />

      <Reveal>
        <Group title="Appearance">
          <Row label="Theme" hint="Follows the sidebar appearance toggle">
            <span className="text-[14px] text-muted-foreground">System</span>
          </Row>
          <Row label="Reduce motion" hint="Minimise background animation">
            <Switch />
          </Row>
          <Row label="Language">
            <span className="text-[14px] text-muted-foreground">English (UK)</span>
          </Row>
        </Group>
      </Reveal>

      <Reveal delay={0.06}>
        <Group title="Notifications">
          <Row label="CPU alerts" hint="Notify above 90% sustained for 5 minutes">
            <Switch defaultChecked />
          </Row>
          <Row label="Auto scaling events">
            <Switch defaultChecked />
          </Row>
          <Row label="Task failures">
            <Switch defaultChecked />
          </Row>
        </Group>
      </Reveal>

      <Reveal delay={0.1}>
        <Group title="Scheduler">
          <Row label="Default policy">
            <span className="text-[14px] text-muted-foreground">Least Loaded</span>
          </Row>
          <Row label="Auto scaling" hint="Expand the fleet under sustained pressure">
            <Switch defaultChecked />
          </Row>
          <Row label="Placement retries">
            <span className="text-[14px] text-muted-foreground">3</span>
          </Row>
        </Group>
      </Reveal>

      <Reveal delay={0.14}>
        <Group title="Resource limits">
          <div className="space-y-5 px-6 py-6">
            <div>
              <div className="flex justify-between text-[14px]">
                <span className="font-medium">Max vCPU per task</span>
                <span className="text-muted-foreground">4</span>
              </div>
              <Slider defaultValue={[4]} max={16} step={1} className="mt-4" />
            </div>
            <div>
              <div className="flex justify-between text-[14px]">
                <span className="font-medium">Max memory per task</span>
                <span className="text-muted-foreground">8 GB</span>
              </div>
              <Slider defaultValue={[8]} max={64} step={1} className="mt-4" />
            </div>
          </div>
        </Group>
      </Reveal>

      <Reveal delay={0.18}>
        <Group title="About">
          <Row label="Virtual Cloud Infrastructure Simulator" hint="Phase 1 · frontend simulation">
            <span className="text-[14px] text-muted-foreground">v1.0</span>
          </Row>
        </Group>
      </Reveal>
    </div>
  );
}