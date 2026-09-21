import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTask,
  createVM,
  deleteTask,
  startTask,
  getTaskStatus,
  completeTask,
  startVM,
  stopVM,
  restartVM,
  deleteVM,
  getTasks,
  getVMs,
} from "@/lib/api";


/* =========================================================
   VM QUERY
========================================================= */

export function useVMs() {
  return useQuery({
    queryKey: ["vms"],
    queryFn: getVMs,
  });
}


/* =========================================================
   CREATE VM
========================================================= */

export function useCreateVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVM,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vms"],
      });
    },
  });
}


/* =========================================================
   DELETE VM
========================================================= */

export function useDeleteVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVM,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vms"],
      });
    },
  });
}

export function useStartVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => startVM(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vms"],
      });
    },
  });
}

export function useStopVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => stopVM(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vms"],
      });
    },
  });
}

export function useRestartVM() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => restartVM(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["vms"],
      });
    },
  });
}


/* =========================================================
   TASK QUERY
========================================================= */

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });
}


/* =========================================================
   CREATE TASK
========================================================= */

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}


/* =========================================================
   DELETE TASK
========================================================= */

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}

/* =========================================================
   START TASK
========================================================= */

export function useStartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => startTask(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });
}

/* =========================================================
   COMPLETE TASK
========================================================= */

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => completeTask(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["compute-nodes"],
      });
    },
  });
}

/* =========================================================
   TASK STATUS POLLING
========================================================= */

export function useTaskStatus(
  taskId: number,
  enabled: boolean,
) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["task-status", taskId],
    queryFn: () => getTaskStatus(taskId),
    enabled,
    refetchInterval: enabled ? 2000 : false,

    onSuccess: (task: any) => {
      if (
        task.status === "completed" ||
        task.status === "failed"
      ) {
        queryClient.invalidateQueries({
          queryKey: ["tasks"],
        });
      }
    },
  });
}