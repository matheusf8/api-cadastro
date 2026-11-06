"""Configurações da aplicação.

Lê as variáveis do arquivo `.env` (veja `.env.example`). Centralizar tudo aqui
evita "números mágicos" espalhados e mantém segredos fora do código.
"""

import logging

from pydantic_settings import BaseSettings, SettingsConfigDict

log = logging.getLogger("uvicorn.error")


class Settings(BaseSettings):
    # "dev" ou "production". Em produção, uma SECRET_KEY fraca IMPEDE a API de subir.
    environment: str = "dev"
    secret_key: str = "dev-only-troque-no-env"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    # Limite de tentativas de login: falhas por (IP + e-mail) dentro da janela.
    login_max_attempts: int = 5
    login_window_seconds: int = 60
    database_url: str = "sqlite:///./app.db"
    frontend_origin: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    def segredo_fraco(self) -> bool:
        """Chave curta ou ainda com o valor de exemplo = qualquer um forjaria tokens."""
        return len(self.secret_key) < 32 or self.secret_key.startswith(("troque", "dev-only"))

    def validar_segredo(self) -> None:
        if not self.segredo_fraco():
            return
        aviso = (
            "SECRET_KEY fraca ou padrão. Gere uma com: "
            'python -c "import secrets; print(secrets.token_urlsafe(64))"'
        )
        if self.environment == "production":
            raise RuntimeError(aviso)  # recusa subir: melhor falhar do que rodar inseguro
        log.warning(aviso)


settings = Settings()
