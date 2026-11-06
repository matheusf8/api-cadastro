"""Pontuações do jogo. TODAS as rotas exigem login (JWT)."""

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import Score, User
from app.schemas import MeusPontos, RankingItem, ScoreCreate, ScoreOut

# `dependencies=[...]` na criação do router: a catraca vale para todas as rotas dele.
router = APIRouter(
    prefix="/scores",
    tags=["pontuações"],
    dependencies=[Depends(get_current_user)],
)

TAMANHO_RANKING = 10


@router.post("", response_model=ScoreOut, status_code=status.HTTP_201_CREATED)
def salvar_pontuacao(
    dados: ScoreCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Score:
    # O dono é o usuário do TOKEN. Nunca confiar num user_id vindo do corpo da requisição,
    # senão qualquer um salvaria pontos em nome de outra pessoa.
    score = Score(user_id=user.id, pontos=dados.pontos)
    db.add(score)
    db.commit()
    return score


@router.get("/top", response_model=list[RankingItem])
def ranking(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[RankingItem]:
    """Top 10: o MELHOR resultado de cada jogador (um jogador aparece uma vez só)."""
    melhor = func.max(Score.pontos).label("pontos")
    linhas = db.execute(
        select(User.id, User.nome, melhor)
        .join(Score, Score.user_id == User.id)
        .group_by(User.id)
        .order_by(melhor.desc(), User.nome)
        .limit(TAMANHO_RANKING)
    ).all()
    return [
        RankingItem(posicao=i, nome=nome, pontos=pontos, voce=(uid == user.id))
        for i, (uid, nome, pontos) in enumerate(linhas, start=1)
    ]


@router.get("/me", response_model=MeusPontos)
def meus_pontos(
    user: User = Depends(get_current_user), db: Session = Depends(get_db)
) -> MeusPontos:
    recorde, partidas = db.execute(
        select(func.coalesce(func.max(Score.pontos), 0), func.count(Score.id)).where(
            Score.user_id == user.id
        )
    ).one()
    return MeusPontos(recorde=recorde, partidas=partidas)
