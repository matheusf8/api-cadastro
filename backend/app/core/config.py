"""Configurações da aplicação.

Lê as variáveis do arquivo `.env` (veja `.env.example`). Centralizar tudo aqui
evita "números mágicos" espalhados e mantém segredos fora do código.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = "dev-only-troque-no-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    database_url: str = "sqlite:///./app.db"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
