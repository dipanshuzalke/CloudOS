import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { VMCard } from "@/components/cloud/vm-card";
import { toast } from "sonner";

import { useDeleteVM, useRestartVM, useStartVM, useStopVM, useVMs } from "@/features/cloud/hooks";

import { mapVM } from "@/lib/api";

import { GlassSkeletonGrid, BackendErrorState, EmptyState } from "@/components/cloud/states";
import { CreateVMDialog } from "@/components/cloud/create-vm";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/os/vms")({
  head: () => ({
    meta: [
      {
        title: "Virtual Machines — Cloud OS",
      },
      {
        name: "description",
        content: "Manage virtual machines and allocated cloud resources.",
      },
    ],
  }),

  component: VMsPage,
});

function VMsPage() {
  const { data = [], isLoading, isError, refetch, isFetching } = useVMs();

  const deleteVM = useDeleteVM();

  const startVM = useStartVM();
  const stopVM = useStopVM();
  const restartVM = useRestartVM();

  const vms = data.map(mapVM);

  const handleStart = async (id: number) => {
    try {
      await startVM.mutateAsync(id);

      toast.success("VM started successfully");
    } catch (error) {
      console.error(error);

      toast.error("Failed to start VM");
    }
  };

  const handleStop = async (id: number) => {
    try {
      await stopVM.mutateAsync(id);

      toast.success("VM stopped successfully");
    } catch (error) {
      console.error(error);

      toast.error("Failed to stop VM");
    }
  };

  const handleRestart = async (id: number) => {
    try {
      await restartVM.mutateAsync(id);

      toast.success("VM restarted successfully");
    } catch (error) {
      console.error(error);

      toast.error("Failed to restart VM");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVM.mutateAsync(id);
      toast.success("VM deleted successfully");
    } catch (error) {
      console.error("Failed to delete VM:", error);
      toast.error("Failed to delete VM");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-9">
        <PageHeader title="Virtual Machines" subtitle="Manage your cloud infrastructure." />

        <GlassSkeletonGrid count={6} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-9">
        <PageHeader title="Virtual Machines" subtitle="Manage your cloud infrastructure." />

        <BackendErrorState onRetry={() => refetch()} retrying={isFetching} />
      </div>
    );
  }

  return (
    <div className="space-y-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          title="Virtual Machines"
          subtitle="Live Docker-backed nodes with real capacity limits and lifecycle controls."
        />
        <CreateVMDialog
          trigger={
            <button className="glass-panel lift inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium">
              <Plus className="size-4 text-primary" /> Create VM
            </button>
          }
        />
      </div>

      {vms.length === 0 ? (
        <EmptyState
          title="No virtual machines"
          subtitle="Create your first virtual machine to start managing cloud resources."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vms.map((vm, i) => (
            <Reveal key={vm.id} delay={i * 0.04}>
              <VMCard
                vm={vm}
                actions
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
                onDelete={handleDelete}
                starting={
  startVM.isPending &&
  startVM.variables === vm.backendId
}

stopping={
  stopVM.isPending &&
  stopVM.variables === vm.backendId
}

restarting={
  restartVM.isPending &&
  restartVM.variables === vm.backendId
}

deleting={
  deleteVM.isPending &&
  deleteVM.variables === vm.backendId
}
              />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
