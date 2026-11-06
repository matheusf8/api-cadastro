"""Ponto de entrada da API.

Rodar (dentro de backend/, com a venv ativa):
    uvicorn app.main:app --reload
Docs interativas: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import health

app = FastAPI(
    title="API Cadastro",
    description="Cadastro, login com JWT e placar do mini jogo.",
    version="0.1.0",
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
# Próximas etapas: app.include_router(auth.router), users.router, scores.router
