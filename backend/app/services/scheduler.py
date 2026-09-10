from sqlalchemy.orm import Session

from app.models.compute_node import ComputeNode

from app.services.resource_manager import can_allocate


SUPPORTED_ALGORITHMS = {
    "first_fit",
    "best_fit",
    "least_loaded",
    "round_robin",
}


def get_active_nodes(
    db: Session,
) -> list[ComputeNode]:
    """
    Return all active compute nodes ordered by ID.
    """

    return (
        db.query(ComputeNode)
        .filter(ComputeNode.status == "active")
        .order_by(ComputeNode.id)
        .all()
    )


def first_fit(
    nodes: list[ComputeNode],
    cpu: int,
    ram: int,
    storage: int,
) -> ComputeNode | None:
    """
    Select the first node that can satisfy the request.
    """

    for node in nodes:
        if can_allocate(
            node,
            cpu,
            ram,
            storage,
        ):
            return node

    return None


def best_fit(
    nodes: list[ComputeNode],
    cpu: int,
    ram: int,
    storage: int,
) -> ComputeNode | None:
    """
    Select the node that leaves the least unused capacity
    after the allocation.
    """

    suitable_nodes = [
        node
        for node in nodes
        if can_allocate(
            node,
            cpu,
            ram,
            storage,
        )
    ]

    if not suitable_nodes:
        return None

    def remaining_capacity(node: ComputeNode) -> int:
        remaining_cpu = node.total_cpu - (
            node.allocated_cpu + cpu
        )

        remaining_ram = node.total_ram - (
            node.allocated_ram + ram
        )

        remaining_storage = node.total_storage - (
            node.allocated_storage + storage
        )

        return (
            remaining_cpu
            + remaining_ram
            + remaining_storage
        )

    return min(
        suitable_nodes,
        key=remaining_capacity,
    )


def least_loaded(
    nodes: list[ComputeNode],
    cpu: int,
    ram: int,
    storage: int,
) -> ComputeNode | None:
    """
    Select the suitable node with the lowest
    overall resource utilization.
    """

    suitable_nodes = [
        node
        for node in nodes
        if can_allocate(
            node,
            cpu,
            ram,
            storage,
        )
    ]

    if not suitable_nodes:
        return None

    def utilization(node: ComputeNode) -> float:
        cpu_usage = (
            node.allocated_cpu / node.total_cpu
        )

        ram_usage = (
            node.allocated_ram / node.total_ram
        )

        storage_usage = (
            node.allocated_storage
            / node.total_storage
        )

        return (
            cpu_usage
            + ram_usage
            + storage_usage
        ) / 3

    return min(
        suitable_nodes,
        key=utilization,
    )


def round_robin(
    nodes: list[ComputeNode],
    cpu: int,
    ram: int,
    storage: int,
    start_index: int = 0,
) -> tuple[ComputeNode | None, int]:
    """
    Select a suitable node using round-robin ordering.

    Returns:
        (selected_node, next_index)
    """

    if not nodes:
        return None, 0

    node_count = len(nodes)

    for offset in range(node_count):
        index = (
            start_index + offset
        ) % node_count

        node = nodes[index]

        if can_allocate(
            node,
            cpu,
            ram,
            storage,
        ):
            next_index = (
                index + 1
            ) % node_count

            return node, next_index

    return None, start_index


def schedule(
    db: Session,
    algorithm: str,
    cpu: int,
    ram: int,
    storage: int,
    round_robin_index: int = 0,
):
    """
    Select a compute node using the requested algorithm.
    """

    if algorithm not in SUPPORTED_ALGORITHMS:
        raise ValueError(
            f"Unsupported scheduling algorithm: {algorithm}"
        )

    nodes = get_active_nodes(db)

    if algorithm == "first_fit":
        return first_fit(
            nodes,
            cpu,
            ram,
            storage,
        )

    if algorithm == "best_fit":
        return best_fit(
            nodes,
            cpu,
            ram,
            storage,
        )

    if algorithm == "least_loaded":
        return least_loaded(
            nodes,
            cpu,
            ram,
            storage,
        )

    if algorithm == "round_robin":
        node, _ = round_robin(
            nodes,
            cpu,
            ram,
            storage,
            round_robin_index,
        )

        return node

    return None