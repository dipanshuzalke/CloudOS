from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskResponse

router = APIRouter(
    prefix="/api/tasks",
    tags=["Tasks"]
)


@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db)
):
    task = Task(
        name=task_data.name,
        cpu_required=task_data.cpu_required,
        ram_required=task_data.ram_required,
        status="queued"
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    return task


@router.get("", response_model=list[TaskResponse])
def get_tasks(
    db: Session = Depends(get_db)
):
    return db.query(Task).all()


@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()

    if not task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(task)
    db.commit()

    return {
        "message": "Task deleted successfully"
    }