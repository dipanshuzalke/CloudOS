import type { VirtualMachine, VMStatus } from "@/features/cloud/data";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/* =========================================================
   VM TYPES
========================================================= */

export interface VMFromAPI {
  id: number;
  name: string;

  status: string;

  cpu: number;
  ram: number;
  storage: number;

  os: string;
  region: string;

  ip: string | null;
  uptime: string | null;

  container_id: string | null;

  created_at: string;
}

export interface CreateVMRequest {
  name: string;
  cpu: number;
  os: string;
  region: string;
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
  data: CreateVMRequest
): Promise<VMFromAPI> {
  const response = await fetch(`${API_URL}/api/vms`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
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

export async function startVM(id: number): Promise<VMFromAPI> {
  const response = await fetch(
    `${API_URL}/api/vms/${id}/start`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to start VM"
    );
  }

  return response.json();
}


export async function stopVM(id: number): Promise<VMFromAPI> {
  const response = await fetch(
    `${API_URL}/api/vms/${id}/stop`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to stop VM"
    );
  }

  return response.json();
}


export async function restartVM(id: number): Promise<VMFromAPI> {
  const response = await fetch(
    `${API_URL}/api/vms/${id}/restart`,
    {
      method: "POST",
    }
  );

  if (!response.ok) {
    const error = await response.text();

    throw new Error(
      error || "Failed to restart VM"
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

export function mapVM(vm: VMFromAPI): VirtualMachine {
  let status: VMStatus;

  switch (vm.status) {
    case "running":
      status = "running";
      break;

    case "stopped":
      status = "stopped";
      break;

    case "provisioning":
      status = "provisioning";
      break;

    case "degraded":
      status = "degraded";
      break;

    default:
      status = "degraded";
  }

  return {
    id: `vm-${String(vm.id).padStart(2, "0")}`,

    // IMPORTANT
    backendId: vm.id,

    name: vm.name,

    status,

    cpu: vm.cpu,
    ram: vm.ram,
    storage: vm.storage,

    os: vm.os,
    region: vm.region,

    ip: vm.ip ?? "Not assigned",
    uptime: vm.uptime ?? "—",

    containerId: vm.container_id ?? undefined,
  };
}