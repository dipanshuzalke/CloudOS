import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.vm import VM
from app.models.user import User
from app.schemas.vm import VMCreate, VMResponse

from app.core.dependencies import get_current_user

from app.services.docker_service import (
    create_vm_container,
    start_vm_container,
    stop_vm_container,
    restart_vm_container,
)

from app.services.docker_service import (
    client,
    get_container_ip,
    get_container_uptime,
)

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

router = APIRouter(
    prefix="/api/vms",
    tags=["VMs"]
)

@router.post("", response_model=VMResponse, status_code=201)
def create_vm(
    vm_data: VMCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if vm_data.os not in OS_IMAGES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported operating system",
        )

    if vm_data.region not in REGIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported region",
        )

    container = None

    try:
        container_name = f"cloudos-vm-{uuid.uuid4().hex[:6]}"

        container = create_vm_container(
            container_name=container_name,
            os_key=vm_data.os,
            cpu=vm_data.cpu,
            ram_mb=vm_data.ram,
        )

        container.reload()

        ip = get_container_ip(container)

        uptime = get_container_uptime(container)

        vm = VM(
            user_id=current_user.id,
            name=vm_data.name,
            os=vm_data.os,
            region=vm_data.region,
            cpu=vm_data.cpu,
            ram=vm_data.ram,
            storage=vm_data.storage,
            status="running",
            container_id=container.id,
        )

        db.add(vm)
        db.commit()
        db.refresh(vm)

        return {
            "id": vm.id,
            "name": vm.name,
            "status": vm.status,
            "cpu": vm.cpu,
            "ram": vm.ram,
            "storage": vm.storage,
            "os": vm.os,
            "region": vm.region,
            "ip": ip,
            "uptime": uptime,
            "container_id": vm.container_id,
            "created_at": vm.created_at,
        }

    except Exception as error:
        if container:
            try:
                container.remove(force=True)
            except Exception:
                pass

        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.get(
    "",
    response_model=list[VMResponse],
)
def get_vms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vms = (
        db.query(VM)
        .filter(VM.user_id == current_user.id)
        .all()
    )

    result = []

    for vm in vms:
        status = vm.status
        ip = None
        uptime = None

        if vm.container_id:
            try:
                container = client.containers.get(
                    vm.container_id
                )

                container.reload()

                docker_status = container.status

                if docker_status == "running":
                    status = "running"

                    ip = get_container_ip(
                        container
                    )

                    uptime = get_container_uptime(
                        container
                    )

                else:
                    status = "stopped"

            except Exception as e:
                print(f"Failed to get Docker container {vm.container_id}: {e}")
                status = "failed"

        result.append({
            "id": vm.id,
            "name": vm.name,
            "status": status,
            "cpu": vm.cpu,
            "ram": vm.ram,
            "storage": vm.storage,
            "os": vm.os,
            "region": vm.region,
            "ip": ip,
            "uptime": uptime,
            "container_id": vm.container_id,
            "created_at": vm.created_at,
        })

    return result


@router.delete("/{vm_id}")
def delete_vm(
    vm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vm = db.query(VM).filter(VM.id == vm_id, VM.user_id == current_user.id,).first()

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

@router.post("/{vm_id}/start", response_model=VMResponse)
def start_vm(
    vm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vm = db.query(VM).filter(VM.id == vm_id, VM.user_id == current_user.id,).first()

    if not vm:
        raise HTTPException(
            status_code=404,
            detail="VM not found",
        )

    if not vm.container_id:
        raise HTTPException(
            status_code=400,
            detail="VM has no Docker container",
        )

    try:
        start_vm_container(vm.container_id)

        vm.status = "running"

        db.commit()
        db.refresh(vm)

        return vm

    except RuntimeError as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.post("/{vm_id}/stop", response_model=VMResponse)
def stop_vm(
    vm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    vm = db.query(VM).filter(VM.id == vm_id, VM.user_id == current_user.id,).first()

    if not vm:
        raise HTTPException(
            status_code=404,
            detail="VM not found",
        )

    if not vm.container_id:
        raise HTTPException(
            status_code=400,
            detail="VM has no Docker container",
        )

    try:
        stop_vm_container(vm.container_id)

        vm.status = "stopped"

        db.commit()
        db.refresh(vm)

        return vm

    except RuntimeError as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )

@router.post("/{vm_id}/restart", response_model=VMResponse)
def restart_vm(
    vm_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vm = db.query(VM).filter(VM.id == vm_id, VM.user_id == current_user.id,).first()

    if not vm:
        raise HTTPException(
            status_code=404,
            detail="VM not found",
        )

    if not vm.container_id:
        raise HTTPException(
            status_code=400,
            detail="VM has no Docker container",
        )

    try:
        restart_vm_container(vm.container_id)

        vm.status = "running"

        db.commit()
        db.refresh(vm)

        return vm

    except RuntimeError as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )