from sqlalchemy.orm import Session

from app.models.compute_node import ComputeNode

def validate_resource_request(
    cpu: int,
    ram: int,
    storage: int,
) -> None:
    if cpu <= 0:
        raise ValueError("CPU must be greater than zero")

    if ram <= 0:
        raise ValueError("RAM must be greater than zero")

    if storage <= 0:
        raise ValueError("Storage must be greater than zero")


class InsufficientResourcesError(Exception):
    """Raised when a compute node does not have enough resources."""
    pass


class NodeUnavailableError(Exception):
    """Raised when a compute node cannot accept allocations."""
    pass


def get_available_cpu(node: ComputeNode) -> int:
    return node.total_cpu - node.allocated_cpu


def get_available_ram(node: ComputeNode) -> int:
    return node.total_ram - node.allocated_ram


def get_available_storage(node: ComputeNode) -> int:
    return node.total_storage - node.allocated_storage


def can_allocate(
    node: ComputeNode,
    cpu: int,
    ram: int,
    storage: int,
) -> bool:
    """
    Check whether a node has enough available resources.
    """

    if node.status != "active":
        return False

    return (
        cpu <= get_available_cpu(node)
        and ram <= get_available_ram(node)
        and storage <= get_available_storage(node)
    )


def allocate_resources(
    db: Session,
    node_id: int,
    cpu: int,
    ram: int,
    storage: int,
) -> ComputeNode:
    """
    Reserve resources on a compute node.

    The node row is locked during the transaction to prevent
    two simultaneous VM requests from allocating the same capacity.
    """

    validate_resource_request(
        cpu,
        ram,
        storage,
    )

    node = (
        db.query(ComputeNode)
        .filter(ComputeNode.id == node_id)
        .with_for_update()
        .first()
    )

    if not node:
        raise ValueError("Compute node not found")

    if node.status != "active":
        raise NodeUnavailableError(
            f"Compute node '{node.name}' is not active"
        )

    if not can_allocate(
        node,
        cpu,
        ram,
        storage,
    ):
        raise InsufficientResourcesError(
            f"Insufficient resources on compute node '{node.name}'"
        )

    node.allocated_cpu += cpu
    node.allocated_ram += ram
    node.allocated_storage += storage

    db.flush()

    return node


def release_resources(
    db: Session,
    node_id: int,
    cpu: int,
    ram: int,
    storage: int,
) -> ComputeNode:
    """
    Release previously allocated resources from a compute node.
    """

    validate_resource_request(
        cpu,
        ram,
        storage,
    )

    node = (
        db.query(ComputeNode)
        .filter(ComputeNode.id == node_id)
        .with_for_update()
        .first()
    )

    if not node:
        raise ValueError("Compute node not found")

    if (
        cpu > node.allocated_cpu
        or ram > node.allocated_ram
        or storage > node.allocated_storage
    ):
        raise ValueError(
            f"Cannot release more resources than currently allocated "
            f"on compute node '{node.name}'"
        )

    node.allocated_cpu -= cpu
    node.allocated_ram -= ram
    node.allocated_storage -= storage

    db.flush()

    return node