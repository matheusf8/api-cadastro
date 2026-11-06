"""Ponto de entrada da API.

Rodar (dentro de backend/, com a venv ativa):
    uvicorn app.main:app --reload
Docs interativas: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (importar registra as tabelas no Base)
from app.core.config import settings
from app.database import Base, engine
from app.routers import auth, health


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Ao subir a API, cria as tabelas que ainda não existem.
    # (Em projeto grande usaríamos migrações com Alembic.)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="API Cadastro",
    description="Cadastro, login com JWT e placar do mini jogo.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS: o navegador só deixa o front (outra origem) chamar a API se ela permitir.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
# Próximas etapas: users.router, scores.router
