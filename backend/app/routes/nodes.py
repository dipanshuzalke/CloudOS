from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.compute_node import ComputeNode
from app.models.user import User

from app.schemas.node import ComputeNodeResponse


router = APIRouter(
    prefix="/api/nodes",
    tags=["Compute Nodes"],
)


def node_to_response(node: ComputeNode) -> dict:
    return {
        "id": node.id,
        "name": node.name,

        "total_cpu": node.total_cpu,
        "allocated_cpu": node.allocated_cpu,
        "available_cpu": node.total_cpu - node.allocated_cpu,

        "total_ram": node.total_ram,
        "allocated_ram": node.allocated_ram,
        "available_ram": node.total_ram - node.allocated_ram,

        "total_storage": node.total_storage,
        "allocated_storage": node.allocated_storage,
        "available_storage": (
            node.total_storage - node.allocated_storage
        ),

        "status": node.status,
        "created_at": node.created_at,
    }


@router.get(
    "",
    response_model=list[ComputeNodeResponse],
)
def get_nodes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    nodes = (
        db.query(ComputeNode)
        .order_by(ComputeNode.id)
        .all()
    )

    return [
        node_to_response(node)
        for node in nodes
    ]


@router.get(
    "/{node_id}",
    response_model=ComputeNodeResponse,
)
def get_node(
    node_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    node = (
        db.query(ComputeNode)
        .filter(ComputeNode.id == node_id)
        .first()
    )

    if not node:
        raise HTTPException(
            status_code=404,
            detail="Compute node not found",
        )

    return node_to_response(node)