from contextlib import asynccontextmanager

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
from app.db.seed import seed_demo_data


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_to_mongo()
    get_settings().upload_path.mkdir(parents=True, exist_ok=True)
    await seed_demo_data()
    yield
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


@app.get("/api/health")
def health():
    return {"status": "ok", "environment": settings.environment}
