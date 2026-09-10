from app.core.database import SessionLocal

from app.services.scheduler import (
    get_active_nodes,
    first_fit,
    best_fit,
    least_loaded,
    round_robin,
)


db = SessionLocal()

try:
    nodes = get_active_nodes(db)

    print("\nAvailable nodes:")

    for node in nodes:
        print(
            f"{node.name}: "
            f"CPU {node.total_cpu - node.allocated_cpu}/"
            f"{node.total_cpu}, "
            f"RAM {node.total_ram - node.allocated_ram}/"
            f"{node.total_ram}, "
            f"Storage {node.total_storage - node.allocated_storage}/"
            f"{node.total_storage}"
        )

    cpu = 4
    ram = 8192
    storage = 20

    print("\nVM request:")
    print(f"CPU: {cpu}")
    print(f"RAM: {ram}")
    print(f"Storage: {storage}")

    node = first_fit(
        nodes,
        cpu,
        ram,
        storage,
    )

    print(
        "\nFirst Fit:",
        node.name if node else "No suitable node",
    )

    node = best_fit(
        nodes,
        cpu,
        ram,
        storage,
    )

    print(
        "Best Fit:",
        node.name if node else "No suitable node",
    )

    node = least_loaded(
        nodes,
        cpu,
        ram,
        storage,
    )

    print(
        "Least Loaded:",
        node.name if node else "No suitable node",
    )

    node, next_index = round_robin(
        nodes,
        cpu,
        ram,
        storage,
    )

    print(
        "Round Robin:",
        node.name if node else "No suitable node",
    )

    print(
        "Next Round Robin index:",
        next_index,
    )

finally:
    db.close()