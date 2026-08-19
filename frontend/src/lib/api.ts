import type { VirtualMachine } from "@/features/cloud/data";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/* =========================================================
   VM TYPES
========================================================= */

export interface VMFromAPI {
  id: number;
  name: string;
  cpu: number;
  ram: number;
  storage: number;
  status: string;
  created_at: string;
}

export interface CreateVMRequest {
  name: string;
  cpu: number;
  ram: number;
  storage: number;
}

/* =========================================================
   TASK TYPES
========================================================= */

export interface TaskFromAPI {
  id: number;
  name: string;
  cpu_required: number;
  ram_required: number;
  status: string;
  created_at: string;
}

export interface CreateTaskRequest {
  name: string;
  cpu_required: number;
  ram_required: number;
}

/* =========================================================
   VM API
========================================================= */

export async function getVMs(): Promise<VMFromAPI[]> {
  const response = await fetch(`${API_URL}/api/vms`);

  if (!response.ok) {
    throw new Error("Failed to fetch VMs");
  }

  return response.json();
}


export async function createVM(
  vm: CreateVMRequest
): Promise<VMFromAPI> {
  const response = await fetch(`${API_URL}/api/vms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(vm),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ?? "Failed to create VM"
    );
  }

  return response.json();
}


export async function deleteVM(vmId: number) {
  const response = await fetch(
    `${API_URL}/api/vms/${vmId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ?? "Failed to delete VM"
    );
  }

  return response.json();
}


/* =========================================================
   TASK API
========================================================= */

export async function getTasks(): Promise<TaskFromAPI[]> {
  const response = await fetch(`${API_URL}/api/tasks`);

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return response.json();
}


export async function createTask(
  task: CreateTaskRequest
): Promise<TaskFromAPI> {
  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(task),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ?? "Failed to create task"
    );
  }

  return response.json();
}


export async function deleteTask(taskId: number) {
  const response = await fetch(
    `${API_URL}/api/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    throw new Error(
      errorData?.detail ?? "Failed to delete task"
    );
  }

  return response.json();
}


/* =========================================================
   VM MAPPER
========================================================= */

const statusMap: Record<
  string,
  VirtualMachine["status"]
> = {
  running: "running",
  stopped: "stopped",
  provisioning: "provisioning",
  degraded: "degraded",
};


export function mapVM(
  vm: VMFromAPI
): VirtualMachine {
  return {
    id: String(vm.id),
    name: vm.name,

    status: statusMap[vm.status] ?? "stopped",

    cpu: vm.cpu,
    ram: vm.ram,
    storage: vm.storage,

    // Phase 2 does not have real infrastructure metadata yet.
    os: "—",
    region: "Local",
    ip: "—",
    uptime: "—",
  };
}