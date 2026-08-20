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