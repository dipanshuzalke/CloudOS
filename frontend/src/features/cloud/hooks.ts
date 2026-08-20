import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  createTask,
  createVM,
  deleteTask,
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