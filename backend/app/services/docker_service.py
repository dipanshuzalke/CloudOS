import docker
from docker.errors import DockerException, NotFound


client = docker.from_env()

OS_IMAGES = {
    "ubuntu": "ubuntu:22.04",
    "debian": "debian:12",
    "alpine": "alpine:3.20",
    "rocky": "rockylinux:9",
}

REGIONS = {
    "us-east-1",
    "us-west-2",
    "eu-west-1",
    "ap-south-1",
}

def create_vm_container(
    container_name: str,
    os_key: str,
    cpu: int,
    ram_mb: int,
):
    if os_key not in OS_IMAGES:
        raise RuntimeError(
            f"Unsupported operating system: {os_key}"
        )

    image = OS_IMAGES[os_key]

    try:
        container = client.containers.run(
            image=image,
            name=container_name,
            command="sleep infinity",
            detach=True,
            nano_cpus=cpu * 1_000_000_000,
            mem_limit=f"{ram_mb}m",
        )

        return container

    except DockerException as error:
        raise RuntimeError(
            f"Failed to create Docker container: {error}"
        )

#Get the real Docker IP
def get_container_ip(container):
    container.reload()

    networks = container.attrs.get(
        "NetworkSettings",
        {}
    ).get("Networks", {})

    for network in networks.values():
        ip = network.get("IPAddress")

        if ip:
            return ip

    return None

#Get uptime
from datetime import datetime, timezone


def get_container_uptime(container):
    container.reload()

    started_at = container.attrs.get(
        "State",
        {}
    ).get("StartedAt")

    if not started_at:
        return None

    started = datetime.fromisoformat(
        started_at.replace("Z", "+00:00")
    )

    now = datetime.now(timezone.utc)

    seconds = int(
        (now - started).total_seconds()
    )

    if seconds < 0:
        return "0m"

    days, remainder = divmod(seconds, 86400)
    hours, remainder = divmod(remainder, 3600)
    minutes, _ = divmod(remainder, 60)

    if days:
        return f"{days}d {hours}h"

    if hours:
        return f"{hours}h {minutes}m"

    return f"{minutes}m"

def delete_container(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.stop()
        container.remove()

    except NotFound:
        # Container is already gone
        pass

def start_vm_container(container_id: str):
    try:
        container = client.containers.get(container_id)

        container.start()

        return container

    except NotFound:
        raise RuntimeError("Docker container not found")

    except DockerException as error:
        raise RuntimeError(
            f"Failed to start container: {error}"
        )


def stop_vm_container(container_id: str):
    try:
        container = client.containers.get(container_id)

        container.stop(timeout=10)

        return container

    except NotFound:
        raise RuntimeError("Docker container not found")

    except DockerException as error:
        raise RuntimeError(
            f"Failed to stop container: {error}"
        )

def restart_vm_container(container_id: str):
    try:
        container = client.containers.get(container_id)

        container.restart(timeout=10)

        return container

    except NotFound:
        raise RuntimeError("Docker container not found")

    except DockerException as error:
        raise RuntimeError(
            f"Failed to restart container: {error}"
        )

def run_task_container(
    container_name: str,
    cpu: int,
    ram_mb: int,
    command: str,
):
    try:
        container = client.containers.run(
            image="alpine:3.20",
            name=container_name,
            command=["sh", "-c", command],
            detach=True,
            nano_cpus=cpu * 1_000_000_000,
            mem_limit=f"{ram_mb}m",
        )

        return container

    except DockerException as error:
        raise RuntimeError(
            f"Failed to run task container: {error}"
        )

def get_task_container_status(container_id: str):
    try:
        container = client.containers.get(container_id)
        container.reload()

        status = container.status

        if status == "exited":
            result = container.wait()
            exit_code = result.get("StatusCode", 1)

            return {
                "status": "completed" if exit_code == 0 else "failed",
                "exit_code": exit_code,
            }

        return {
            "status": "running",
            "exit_code": None,
        }

    except NotFound:
        raise RuntimeError("Task container not found")

    except DockerException as error:
        raise RuntimeError(
            f"Failed to check task container: {error}"
        )

def delete_task_container(container_id: str):
    try:
        container = client.containers.get(container_id)

        if container.status == "running":
            container.stop(timeout=10)

        container.remove()

    except NotFound:
        # Container is already gone
        pass

    except DockerException as error:
        raise RuntimeError(
            f"Failed to delete task container: {error}"
        )

def get_container_stats(container):
    """
    Get real-time CPU, memory and network statistics
    from a running Docker container.
    """

    try:
        container.reload()

        stats = container.stats(stream=False)

        # -----------------------------
        # CPU Usage
        # -----------------------------
        cpu_stats = stats.get("cpu_stats", {})
        precpu_stats = stats.get("precpu_stats", {})

        cpu_delta = (
            cpu_stats.get("cpu_usage", {}).get("total_usage", 0)
            - precpu_stats.get("cpu_usage", {}).get("total_usage", 0)
        )

        system_delta = (
            cpu_stats.get("system_cpu_usage", 0)
            - precpu_stats.get("system_cpu_usage", 0)
        )

        online_cpus = cpu_stats.get("online_cpus")

        if not online_cpus:
            percpu_usage = (
                cpu_stats.get("cpu_usage", {})
                .get("percpu_usage", [])
            )

            online_cpus = len(percpu_usage) or 1

        if system_delta > 0 and cpu_delta > 0:
            cpu_percent = (
                (cpu_delta / system_delta)
                * online_cpus
                * 100.0
            )
        else:
            cpu_percent = 0.0

        # -----------------------------
        # Memory Usage
        # -----------------------------
        memory_stats = stats.get("memory_stats", {})

        memory_usage = memory_stats.get("usage", 0)
        memory_limit = memory_stats.get("limit", 0)

        if memory_limit > 0:
            memory_percent = (
                memory_usage / memory_limit
            ) * 100.0
        else:
            memory_percent = 0.0

        # -----------------------------
        # Network Usage
        # -----------------------------
        networks = stats.get("networks", {})

        network_rx_bytes = 0
        network_tx_bytes = 0

        for network in networks.values():
            network_rx_bytes += network.get(
                "rx_bytes",
                0
            )

            network_tx_bytes += network.get(
                "tx_bytes",
                0
            )

        return {
            "cpu_percent": round(cpu_percent, 2),

            "memory_usage": memory_usage,
            "memory_limit": memory_limit,
            "memory_percent": round(
                memory_percent,
                2
            ),

            "network_rx_bytes": network_rx_bytes,
            "network_tx_bytes": network_tx_bytes,
        }

    except NotFound:
        raise RuntimeError(
            "Docker container not found"
        )

    except DockerException as error:
        raise RuntimeError(
            f"Failed to get container stats: {error}"
        )