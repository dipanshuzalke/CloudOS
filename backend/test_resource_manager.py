from app.core.database import SessionLocal
from app.models.compute_node import ComputeNode

from app.services.resource_manager import (
    can_allocate,
    allocate_resources,
    release_resources,
)


db = SessionLocal()

try:
    node = (
        db.query(ComputeNode)
        .filter(ComputeNode.name == "node-a")
        .first()
    )

    if not node:
        raise Exception("node-a not found")

    print("Before:")
    print("CPU:", node.allocated_cpu)
    print("RAM:", node.allocated_ram)
    print("Storage:", node.allocated_storage)

    print(
        "Can allocate:",
        can_allocate(
            node,
            cpu=4,
            ram=8192,
            storage=20,
        ),
    )

    allocate_resources(
        db,
        node.id,
        cpu=4,
        ram=8192,
        storage=20,
    )

    db.commit()

    db.refresh(node)

    print("\nAfter allocation:")
    print("CPU:", node.allocated_cpu)
    print("RAM:", node.allocated_ram)
    print("Storage:", node.allocated_storage)

    release_resources(
        db,
        node.id,
        cpu=4,
        ram=8192,
        storage=20,
    )

    db.commit()

    db.refresh(node)

    print("\nAfter release:")
    print("CPU:", node.allocated_cpu)
    print("RAM:", node.allocated_ram)
    print("Storage:", node.allocated_storage)

finally:
    db.close()