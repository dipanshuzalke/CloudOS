import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { VMCard } from "@/components/cloud/vm-card";
import { virtualMachines } from "@/features/cloud/data";

export const Route = createFileRoute("/os/vms")({
  head: () => ({
    meta: [
      { title: "Virtual Machines — Cloud OS" },
      { name: "description", content: "Twelve simulated virtual machines with live CPU, memory, storage, region and image details." },
      { property: "og:title", content: "Virtual Machines — Cloud OS" },
      { property: "og:description", content: "Inspect and control simulated virtual machines across five regions." },
    ],
  }),
  component: VMsPage,
});

function VMsPage() {
  return (
    <div className="space-y-9">
      <PageHeader
        title="Virtual Machines"
        subtitle="Twelve simulated nodes across five regions, with live capacity and lifecycle controls."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {virtualMachines.map((vm, i) => (
          <Reveal key={vm.id} delay={i * 0.04}>
            <VMCard vm={vm} actions />
          </Reveal>
        ))}
      </div>
    </div>
  );
}