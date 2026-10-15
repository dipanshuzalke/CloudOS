import asyncio

from app.core.database import SessionLocal
from app.services.monitoring_service import collect_vm_metrics


async def monitoring_loop():
    while True:
        db = SessionLocal()

        try:
            collect_vm_metrics(db)
        except Exception as error:
            print(f"[Monitoring] Collection failed: {error}")
        finally:
            db.close()

        await asyncio.sleep(30)