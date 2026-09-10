from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import VM, Task, User
from app.routes import vms, tasks, auth, nodes, scheduler


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Infrastructure Management Platform",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(vms.router)
app.include_router(tasks.router)
app.include_router(auth.router)
app.include_router(nodes.router)
app.include_router(scheduler.router)


@app.get("/")
def root():
    return {
        "message": "Cloud Infrastructure API is running"
    }