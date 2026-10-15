import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import Base, engine
from app.models import VM, Task, User
from app.routes import vms, tasks, auth, nodes, scheduler, monitoring
from app.services.monitoring_worker import monitoring_loop
from app.routes.autoscaling import router as autoscaling_router
from app.services.autoscaling_worker import autoscaling_worker


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud Infrastructure Management Platform",
    version="1.0.0"
)

@app.on_event("startup")
async def start_monitoring():
    asyncio.create_task(monitoring_loop())

@app.on_event("startup")
async def start_workers():
    print("FASTAPI STARTUP EVENT FIRED", flush=True)

    app.state.monitoring_task = asyncio.create_task(
        monitoring_loop()
    )

    print("Monitoring worker scheduled", flush=True)

    app.state.autoscaling_task = asyncio.create_task(
        autoscaling_worker()
    )

    print("Auto-scaling task scheduled", flush=True)


@app.on_event("shutdown")
async def stop_workers():
    tasks = [
        getattr(app.state, "monitoring_task", None),
        getattr(app.state, "autoscaling_task", None),
    ]

    for task in tasks:
        if task and not task.done():
            task.cancel()

    for task in tasks:
        if task:
            try:
                await task
            except asyncio.CancelledError:
                pass


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
app.include_router(monitoring.router)
app.include_router(autoscaling_router)

@app.get("/")
def root():
    return {
        "message": "Cloud Infrastructure API is running"
    }