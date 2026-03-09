from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import HTTPException
from routers import auth, tasks
from database import engine, Base
import models
import os
from dotenv import load_dotenv

load_dotenv()

# create tables safely
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexus API Python")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    "https://your-vercel-app.vercel.app"
        "http://localhost:5174",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"ERROR: {exc}")
    return JSONResponse(
        status_code=500,
        content={"success": False, "message": "Server Error", "error": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        }
    )

app.include_router(auth.router, prefix="/api/v1/auth/login", tags=["Auth"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["Tasks"])

@app.get("/")
def root():
    return {"message": "API is running..."}

if __name__ == "__main__":
    import uvicorn
    PORT = int(os.getenv("PORT", 5000))
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=False)
