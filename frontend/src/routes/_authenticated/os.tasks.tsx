import { motion } from "motion/react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/os/shell";
import { Reveal } from "@/components/motion/reveal";
import { BackendErrorState, EmptyState, GlassSkeletonGrid } from "@/components/cloud/states";
import { CreateTaskDialog } from "@/components/cloud/create-vm";

import { useDeleteTask, useStartTask, useTaskStatus, useTasks } from "@/features/cloud/hooks";

import type { TaskFromAPI } from "@/lib/api";

export const Route = createFileRoute("/_authenticated/os/tasks")({
  head: () => ({
    meta: [
      {
        title: "Tasks — Cloud OS",
      },
      {
        name: "description",
        content: "Manage workloads stored in the Cloud OS platform database.",
      },
      {
        property: "og:title",
        content: "Tasks — Cloud OS",
      },
      {
        property: "og:description",
        content: "Create and manage workloads in Cloud OS.",
      },
    ],
  }),

  component: TasksPage,
});

/* =========================================================
   TASK STATE
========================================================= */

type TaskState = "running" | "queued" | "completed" | "failed";

const groups: {
  state: TaskState;
  label: string;
  accent: string;
}[] = [
  {
    state: "running",
    label: "Running",
    accent: "bg-primary",
  },
  {
    state: "queued",
    label: "Queued",
    accent: "bg-muted-foreground",
  },
  {
    state: "completed",
    label: "Completed",
    accent: "bg-success",
  },
  {
    state: "failed",
    label: "Failed",
    accent: "bg-destructive",
  },
];

/* =========================================================
   MAP BACKEND STATUS
========================================================= */

function normalizeTaskState(status: string): TaskState {
  switch (status.toLowerCase()) {
    case "running":
      return "running";

    case "completed":
      return "completed";

    case "failed":
      return "failed";

    case "queued":
    case "pending":
    case "created":
    default:
      return "queued";
  }
}

/* =========================================================
   TASK PAGE
========================================================= */

function TasksPage() {
  const { data: tasks = [], isLoading, isError, refetch, isFetching } = useTasks();

  const deleteTask = useDeleteTask();
  const startTask = useStartTask();

  const handleDelete = async (id: number) => {
    try {
      await deleteTask.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleStart = async (id: number) => {
    try {
      await startTask.mutateAsync(id);
    } catch (error) {
      console.error("Failed to start task:", error);
    }
  };

  /* =======================================================
     HEADER
  ======================================================= */

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <PageHeader title="Workloads" subtitle="Every task stored in the platform database." />

      <CreateTaskDialog
        trigger={
          <button
            type="button"
            className="glass-panel lift inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-medium"
          >
            <Plus className="size-4 text-primary" />
            Create Task
          </button>
        }
      />
    </div>
  );

  /* =======================================================
     LOADING
  ======================================================= */

  if (isLoading) {
    return (
      <div className="space-y-10">
        {header}

        <GlassSkeletonGrid count={6} />
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (isError) {
    return (
      <div className="space-y-10">
        {header}

        <BackendErrorState onRetry={() => refetch()} retrying={isFetching} />
      </div>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (tasks.length === 0) {
    return (
      <div className="space-y-10">
        {header}

        <EmptyState
          title="No workloads queued"
          subtitle="Create a task to place it in the platform database."
        />
      </div>
    );
  }

  /* =======================================================
     GROUP TASKS
  ======================================================= */

  return (
    <div className="space-y-10">
      {header}

      {groups.map((group, groupIndex) => {
        const items = tasks.filter((task) => normalizeTaskState(task.status) === group.state);

        return (
          <section key={group.state} className="space-y-4">
            {/* Section heading */}

            <div className="flex items-center gap-3">
              <span className={`size-2 rounded-full ${group.accent}`} />

              <h2 className="text-[19px] font-semibold">{group.label}</h2>

              <span className="text-[13px] text-muted-foreground">{items.length}</span>
            </div>

            {/* Task cards */}

            {items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    index={groupIndex + index}
                    onDelete={handleDelete}
                    onStart={handleStart}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[20px] border border-glass-border p-5 text-[13px] text-muted-foreground">
                No {group.label.toLowerCase()} workloads.
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

/* =========================================================
   TASK CARD
========================================================= */

function TaskCard({
  task,
  index,
  onDelete,
  onStart,
}: {
  task: TaskFromAPI;
  index: number;
  onDelete: (id: number) => void;
  onStart: (id: number) => void;
}) {
  const state = normalizeTaskState(task.status);

  useTaskStatus(task.id, state === "running");

  const progress = state === "completed" ? 100 : state === "running" ? 50 : 0;

  const progressColor =
    state === "failed" ? "bg-destructive" : state === "completed" ? "bg-success" : "bg-primary";

  return (
    <Reveal delay={index * 0.05}>
      <div className="glass-panel lift h-full rounded-[26px] p-6">
        {/* Header */}

        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-mono text-[15px] font-semibold">{task.name}</div>

            <div className="mt-1 text-[12px] text-muted-foreground">Task #{task.id}</div>
          </div>

          <span className="rounded-full border border-glass-border px-3 py-1 text-[12px] text-muted-foreground">
            {state === "queued"
              ? "Queued"
              : state === "running"
                ? "Running"
                : state === "completed"
                  ? "Completed"
                  : "Failed"}
          </span>
        </div>

        {/* Progress */}

        <div className="mt-6 h-1.5 rounded-full bg-muted">
          <motion.div
            className={`h-full rounded-full ${progressColor}`}
            initial={{
              width: 0,
            }}
            whileInView={{
              width: `${progress}%`,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 1.2,
              delay: index * 0.06,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        </div>

        {/* Resource information */}

        <div className="mt-4 grid grid-cols-2 gap-4 text-[12.5px] text-muted-foreground">
          <div>
            <div>CPU Required</div>

            <div className="mt-1 font-medium text-foreground">{task.cpu_required} vCPU</div>
          </div>

          <div>
            <div>Memory Required</div>

            <div className="mt-1 font-medium text-foreground">{task.ram_required} MB</div>
          </div>

          <div>
            <div>Storage Required</div>

            <div className="mt-1 font-medium text-foreground">{task.storage_required} GB</div>
          </div>

          <div>
            <div>Compute Node</div>

            <div className="mt-1 font-medium text-foreground">
              {task.node_id !== null ? `Node #${task.node_id}` : "Not assigned"}
            </div>
          </div>
        </div>
        {/* Phase 2 information */}

        <div className="mt-5 space-y-2 text-[12px] text-muted-foreground">
          {/* <div className="flex justify-between">
            <span>Assigned VM</span>

            <span>Not assigned</span>
          </div> */}

          <div className="flex justify-between">
            <span>{state === "running" ? "Execution" : "Progress"}</span>

            <span>{state === "running" ? "Docker workload running" : `${progress}%`}</span>
          </div>
        </div>

        {/* Delete */}

        <div className="mt-6 flex items-center gap-2">
          {state === "queued" && (
            <button
              type="button"
              onClick={() => onStart(task.id)}
              className="rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Task
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(task.id)}
            className="rounded-full px-4 py-2 text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Delete
          </button>
        </div>
      </div>
    </Reveal>
  );
}
