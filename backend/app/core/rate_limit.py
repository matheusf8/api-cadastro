"""Limite de tentativas de login (proteção contra força bruta).

Ideia: conta as FALHAS de cada chave (IP + e-mail) numa janela de tempo. Passou do
máximo, a API responde 429 até a janela esvaziar. Login com sucesso zera a contagem.

Limites assumidos (é um projeto de estudo):
- Fica em MEMÓRIA: reinicia com o servidor e não é compartilhado entre processos.
  Em produção usaria Redis (ou um proxy/WAF como o nginx ou Cloudflare).
- Atrás de proxy reverso, `request.client.host` seria o IP do proxy.
"""

import time
from collections import defaultdict, deque
from collections.abc import Callable

from app.core.config import settings


class RateLimiter:
    def __init__(
        self,
        max_attempts: int,
        window_seconds: int,
        clock: Callable[[], float] = time.monotonic,
    ) -> None:
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._clock = clock
        self._falhas: dict[str, deque[float]] = defaultdict(deque)

    def _limpa_antigas(self, key: str) -> deque[float]:
        falhas = self._falhas[key]
        limite = self._clock() - self.window_seconds
        while falhas and falhas[0] <= limite:
            falhas.popleft()
        if not falhas:
            self._falhas.pop(key, None)  # não acumula chaves antigas na memória
        return falhas

    def retry_after(self, key: str) -> int:
        """Segundos até poder tentar de novo. 0 = liberado."""
        falhas = self._limpa_antigas(key)
        if len(falhas) < self.max_attempts:
            return 0
        return max(1, int(falhas[0] + self.window_seconds - self._clock()) + 1)

    def register_failure(self, key: str) -> None:
        self._limpa_antigas(key)
        self._falhas[key].append(self._clock())

    def reset(self, key: str) -> None:
        self._falhas.pop(key, None)

    def clear(self) -> None:
        self._falhas.clear()


login_limiter = RateLimiter(
    max_attempts=settings.login_max_attempts,
    window_seconds=settings.login_window_seconds,
)
