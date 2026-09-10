from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import hash_password
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.user import UserRegister, UserResponse, RegisterResponse

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)
from app.schemas.user import (
    TokenResponse,
    UserLogin,
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"],
)


@router.post("/register", response_model=RegisterResponse)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db),
):
    existing_user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    existing_username = (
        db.query(User)
        .filter(User.username == user_data.username)
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists",
        )

    user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }

@router.post("/login", response_model=TokenResponse)
def login(
    user_data: UserLogin,
    db: Session = Depends(get_db),
):
    user = (
        db.query(User)
        .filter(User.email == user_data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        user_data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    access_token = create_access_token({
        "sub": str(user.id)
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user