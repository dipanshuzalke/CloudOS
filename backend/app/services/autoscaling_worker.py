
import asyncio
import logging

from app.core.database import SessionLocal
from app.services.autoscaling_service import (
    detect_high_cpu_vms,
    scale_up_vm,
)

logger = logging.getLogger(__name__)

CHECK_INTERVAL_SECONDS = 30


async def autoscaling_worker():
    print("AUTOSCALING WORKER FUNCTION ENTERED", flush=True)
    logger.info("Auto-scaling worker started")

    while True:
        try:
            db = SessionLocal()

            try:
                print("Checking VMs for auto-scaling...", flush=True)

                candidates = detect_high_cpu_vms(db)

                print(
                    f"Auto-scaling candidates: {candidates}",
                    flush=True,
                )

                # Scale only one VM per cycle.
                if candidates:
                    candidate = candidates[0]

                    try:
                        result = scale_up_vm(
                            db,
                            candidate["vm_id"],
                        )
                        logger.info(
                            "Auto-scaling successful: %s",
                            result,
                        )

                    except Exception:
                        db.rollback()
                        logger.exception(
                            "Auto-scaling failed for VM %s",
                            candidate["vm_id"],
                        )

            finally:
                db.close()

        except Exception:
            logger.exception("Auto-scaling worker iteration failed")

        await asyncio.sleep(CHECK_INTERVAL_SECONDS)
