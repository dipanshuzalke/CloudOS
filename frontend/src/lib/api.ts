import type { VirtualMachine, VMStatus } from "@/features/cloud/data";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

/* =========================================================
   AUTH TYPES
========================================================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  access_token: string;
  token_type: string;
  user: UserFromAPI;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserFromAPI {
  id: number;
  username: string;
  email: string;
}

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
   API FETCH HELPER
========================================================= */

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token =
    localStorage.getItem("cloudos_token");

  const headers = new Headers(
    options.headers
  );

  headers.set(
    "Content-Type",
    "application/json"
  );

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => null);

    throw new Error(
      error?.detail ||
        `Request failed: ${response.status}`
    );
  }

  return response;
}

/* =========================================================
   AUTH API
========================================================= */

/**
 * Register a new user
 */
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const response = await apiFetch(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

/**
 * Login user
 *
 * Returns JWT access token.
 */
export async function loginUser(
  data: LoginRequest
): Promise<LoginResponse> {
  /*
   * Login does not require an existing JWT,
   * but apiFetch will simply skip the Authorization
   * header if no token exists.
   */
  const response = await apiFetch(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

/**
 * Get currently authenticated user
 */
export async function getCurrentUser(): Promise<UserFromAPI> {
  const response = await apiFetch(
    "/api/auth/me"
  );

  return response.json();
}

/* =========================================================
   LOGOUT
========================================================= */

/**
 * Remove locally stored authentication data.
 *
 * JWT authentication is stateless, so logout is handled
 * by removing the token from the browser.
 */
export function logoutUser(): void {
  localStorage.removeItem(
    "cloudos_token"
  );

  localStorage.removeItem(
    "cloudos_user"
  );
}

/* =========================================================
   VM API
========================================================= */

/**
 * Get VMs belonging to the authenticated user.
 */
export async function getVMs(): Promise<VMFromAPI[]> {
  const response = await apiFetch(
    "/api/vms",
    {
      method: "GET",
    }
  );

  return response.json();
}

/**
 * Create VM
 *
 * The backend determines the user from JWT.
 * Do NOT send user_id from the frontend.
 */
export async function createVM(
  data: CreateVMRequest
): Promise<VMFromAPI> {
  const response = await apiFetch(
    "/api/vms",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return response.json();
}

/**
 * Delete VM
 */
export async function deleteVM(
  vmId: number
): Promise<VMFromAPI> {
  const response = await apiFetch(
    `/api/vms/${vmId}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
}

/**
 * Start VM
 */
export async function startVM(
  id: number
): Promise<VMFromAPI> {
  const response = await apiFetch(
    `/api/vms/${id}/start`,
    {
      method: "POST",
    }
  );

  return response.json();
}

/**
 * Stop VM
 */
export async function stopVM(
  id: number
): Promise<VMFromAPI> {
  const response = await apiFetch(
    `/api/vms/${id}/stop`,
    {
      method: "POST",
    }
  );

  return response.json();
}

/**
 * Restart VM
 */
export async function restartVM(
  id: number
): Promise<VMFromAPI> {
  const response = await apiFetch(
    `/api/vms/${id}/restart`,
    {
      method: "POST",
    }
  );

  return response.json();
}

/* =========================================================
   TASK API
========================================================= */

export async function getTasks(): Promise<TaskFromAPI[]> {
  const response = await apiFetch(
    "/api/tasks",
    {
      method: "GET",
    }
  );

  return response.json();
}

export async function createTask(
  task: CreateTaskRequest
): Promise<TaskFromAPI> {
  const response = await apiFetch(
    "/api/tasks",
    {
      method: "POST",
      body: JSON.stringify(task),
    }
  );

  return response.json();
}

export async function deleteTask(
  taskId: number
): Promise<TaskFromAPI> {
  const response = await apiFetch(
    `/api/tasks/${taskId}`,
    {
      method: "DELETE",
    }
  );

  return response.json();
}

/* =========================================================
   VM MAPPER
========================================================= */

export function mapVM(
  vm: VMFromAPI
): VirtualMachine {
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

    /*
     * Real PostgreSQL VM ID.
     *
     * Keep this separate from the UI ID.
     */
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

    ...(vm.container_id !== null && {
      containerId: vm.container_id,
    }),
  };
}