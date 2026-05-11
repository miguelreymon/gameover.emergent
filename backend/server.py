"""
Placeholder FastAPI app.

This project is a Next.js application (located at the repository root).
All API logic lives inside the Next.js app under `src/app/api/...`.

This file only exists to satisfy the local Emergent supervisor configuration,
which expects a backend service at /app/backend. It is NOT used in production
(Vercel) deployments.
"""
from fastapi import FastAPI

app = FastAPI(title="Emergent placeholder backend")


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "note": "Next.js app at repo root handles real APIs"}
