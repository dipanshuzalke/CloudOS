from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vm import VM
from app.schemas.vm import VMCreate, VMResponse

router = APIRouter(
    prefix="/api/vms",
    tags=["VMs"]
)


@router.post("", response_model=VMResponse, status_code=201)
def create_vm(
    vm_data: VMCreate,
    db: Session = Depends(get_db)
):
    vm = VM(
        name=vm_data.name,
        cpu=vm_data.cpu,
        ram=vm_data.ram,
        storage=vm_data.storage,
        status="stopped"
    )

    db.add(vm)
    db.commit()
    db.refresh(vm)

    return vm


@router.get("", response_model=list[VMResponse])
def get_vms(
    db: Session = Depends(get_db)
):
    return db.query(VM).all()


@router.delete("/{vm_id}")
def delete_vm(
    vm_id: int,
    db: Session = Depends(get_db)
):
    vm = db.query(VM).filter(VM.id == vm_id).first()

    if not vm:
        raise HTTPException(
            status_code=404,
            detail="VM not found"
        )

    db.delete(vm)
    db.commit()

    return {
        "message": "VM deleted successfully"
    }