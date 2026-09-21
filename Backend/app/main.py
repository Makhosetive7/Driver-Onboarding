from contextlib import asynccontextmanager
import asyncio
import logging

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api import (
    admin,
    applications,
    auth,
    documents,
    identity,
    profile,
    vehicle,
)
from app.core.config import get_settings
from app.db.mongo import close_mongo_connection, connect_to_mongo
from app.db.seed import seed_admin, seed_demo_data

log = logging.getLogger("takeoff")


async def _startup() -> None:
    settings = get_settings()
    try:
        await asyncio.wait_for(connect_to_mongo(), timeout=20)
        settings.upload_path.mkdir(parents=True, exist_ok=True)
        if settings.is_development:
            await seed_demo_data()
        else:
            await seed_admin()
    except Exception:
        log.exception("Startup database init failed")


@asynccontextmanager
async def lifespan(_: FastAPI):
    task = asyncio.create_task(_startup())
    yield
    task.cancel()
    try:
        await task
    except (asyncio.CancelledError, Exception):
        pass
    await close_mongo_connection()


app = FastAPI(
    title="TakeOFF Driver Onboarding API",
    version="1.0.0",
    lifespan=lifespan,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(identity.router)
app.include_router(vehicle.router)
app.include_router(documents.router)
app.include_router(applications.router)
app.include_router(admin.router)


@app.get("/")
@app.get("/api/health")
def health():
    return {"status": "ok", "environment": settings.environment}
