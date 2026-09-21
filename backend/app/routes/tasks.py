from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user

from app.models.task import Task
from app.models.user import User

from app.schemas.task import TaskCreate, TaskResponse

from app.services.docker_service import run_task_container
from app.services.docker_service import get_task_container_status, delete_task_container

from app.services.scheduler import schedule
from app.services.scheduler_config import get_scheduler_algorithm
from app.services.resource_manager import (
    allocate_resources,
    release_resources,
    InsufficientResourcesError,
    NodeUnavailableError,
)


router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"],
)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # -------------------------------------------------
        # 1. Get the globally active scheduler
        # -------------------------------------------------
        algorithm = get_scheduler_algorithm(db)

        # -------------------------------------------------
        # 2. Find a suitable compute node
        # -------------------------------------------------
        selected_node = schedule(
            db=db,
            algorithm=algorithm,
            cpu=task_data.cpu_required,
            ram=task_data.ram_required,
            storage=task_data.storage_required,
        )

        if selected_node is None:
            raise HTTPException(
                status_code=409,
                detail="Insufficient resources available for this task.",
            )

        # -------------------------------------------------
        # 3. Allocate resources on selected node
        # -------------------------------------------------
        allocate_resources(
            db=db,
            node_id=selected_node.id,
            cpu=task_data.cpu_required,
            ram=task_data.ram_required,
            storage=task_data.storage_required,
        )

        # -------------------------------------------------
        # 4. Create task record
        # -------------------------------------------------
        task = Task(
            name=task_data.name,
            cpu_required=task_data.cpu_required,
            ram_required=task_data.ram_required,
            storage_required=task_data.storage_required,
            command=task_data.command,
            status="queued",
            node_id=selected_node.id,
            user_id=current_user.id,
        )

        db.add(task)
        db.commit()
        db.refresh(task)

        return task

    except HTTPException:
        db.rollback()
        raise

    except (InsufficientResourcesError, NodeUnavailableError) as error:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail=str(error),
        )

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Task)
        .filter(Task.user_id == current_user.id)
        .order_by(Task.created_at.desc())
        .all()
    )


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    try:
        # -------------------------------------------------
        # Release resources reserved for the task
        # -------------------------------------------------
        if task.node_id is not None:
            release_resources(
                db=db,
                node_id=task.node_id,
                cpu=task.cpu_required,
                ram=task.ram_required,
                storage=task.storage_required,
            )

        # -------------------------------------------------
        # Delete task
        # -------------------------------------------------
        db.delete(task)
        db.commit()

        return {
            "message": "Task deleted successfully",
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.post("/{task_id}/start", response_model=TaskResponse)
def start_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    if task.status != "queued":
        raise HTTPException(
            status_code=409,
            detail=f"Task cannot be started from '{task.status}' state.",
        )

    if task.node_id is None:
        raise HTTPException(
            status_code=409,
            detail="Task is not assigned to a compute node.",
        )

    try:
        # ---------------------------------------------
        # Create Docker execution container
        # ---------------------------------------------
        container = run_task_container(
            container_name=f"cloudos-task-{task.id}",
            cpu=task.cpu_required,
            ram_mb=task.ram_required,
            command=task.command,
        )

        # ---------------------------------------------
        # Save Docker container ID
        # ---------------------------------------------
        task.container_id = container.id

        # ---------------------------------------------
        # Mark task as running
        # ---------------------------------------------
        task.status = "running"

        db.commit()
        db.refresh(task)

        return task

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    # Task must be running before it can be completed
    if task.status != "running":
        raise HTTPException(
            status_code=409,
            detail=f"Task cannot be completed from '{task.status}' state.",
        )

    if task.node_id is None:
        raise HTTPException(
            status_code=409,
            detail="Task is not assigned to a compute node.",
        )

    try:
        # Release resources reserved by this task
        release_resources(
            db=db,
            node_id=task.node_id,
            cpu=task.cpu_required,
            ram=task.ram_required,
            storage=task.storage_required,
        )

        # Mark task as completed
        task.status = "completed"

        db.commit()
        db.refresh(task)

        return task

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.get("/{task_id}/status", response_model=TaskResponse)
def get_task_status(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = (
        db.query(Task)
        .filter(
            Task.id == task_id,
            Task.user_id == current_user.id,
        )
        .first()
    )

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found",
        )

    # Nothing to check if task is not running
    if task.status != "running":
        return task

    if not task.container_id:
        raise HTTPException(
            status_code=409,
            detail="Running task has no Docker container.",
        )

    try:
        docker_status = get_task_container_status(
            task.container_id
        )

        # Container is still running
        if docker_status["status"] == "running":
            return task

        # Container finished
        if task.node_id is not None:
            release_resources(
                db=db,
                node_id=task.node_id,
                cpu=task.cpu_required,
                ram=task.ram_required,
                storage=task.storage_required,
            )

        task.status = docker_status["status"]
        delete_task_container(task.container_id)

        db.commit()
        db.refresh(task)

        return task

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )