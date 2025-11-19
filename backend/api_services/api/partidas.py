from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, case # Para contagem de vagas

from core.database import get_db
from models.quadras import (
    Agendamento, StatusAgendamento, 
    Partida, Participante, PapelParticipante
)
from models.user import Usuario
from schemas.quadras import PartidaCreate, PartidaOut, ParticipanteOut
from .deps import DBSession, CurrentUser

router = APIRouter(prefix="/partidas", tags=["Partidas (Fecha Time)"])


@router.post(
    "/agendamento/{id_agendamento}", 
    response_model=PartidaOut, 
    status_code=status.HTTP_201_CREATED
)
def create_partida(
    id_agendamento: int,
    partida_in: PartidaCreate,
    db: DBSession,
    current_user: CurrentUser
):
    """
    Cria uma nova Partida Aberta (Fecha Time) a partir de um agendamento.
    
    - Requer que o agendamento esteja 'confirmado'.
    - Requer que o usuário logado seja o dono do agendamento.
    - Adiciona o usuário logado como o 'organizador' da partida.
    """
    

    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
    
    if agendamento.id_usuario != current_user.id_usuario:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o dono do agendamento pode criar uma partida."
        )

    if agendamento.status != StatusAgendamento.confirmado:
        raise HTTPException(
            status_code=400, 
            detail="Apenas agendamentos 'confirmados' podem virar partidas."
        )

    if agendamento.partida:
        raise HTTPException(
            status_code=409, 
            detail="Este agendamento já possui uma partida associada."
        )

    db_partida = Partida(
        **partida_in.model_dump(),
        id_agendamento=id_agendamento
    )
    
    organizador = Participante(
        id_usuario=current_user.id_usuario,
        papel=PapelParticipante.organizador
    )
    db_partida.participantes.append(organizador)
    
    db.add(db_partida)
    db.commit()
    db.refresh(db_partida)
    return db_partida


@router.get("/abertas", response_model=List[PartidaOut])
def list_partidas_abertas(db: DBSession):
    """
    Lista todas as partidas que ainda têm vagas abertas.
    Este é o feed principal do "Fecha Time".
    """
    count_subquery = (
        db.query(
            Participante.id_partida,
            func.count(Participante.id_usuario).label("contagem_participantes")
        )
        .group_by(Participante.id_partida)
        .subquery()
    )

    partidas = (
        db.query(Partida)
        .join(
            count_subquery, 
            Partida.id_partida == count_subquery.c.id_partida
        )
        .filter(count_subquery.c.contagem_participantes < Partida.limite_jogadores)
        .options(
            selectinload(Partida.agendamento).selectinload(Agendamento.espaco),
            selectinload(Partida.participantes).selectinload(Participante.usuario)
        )
        .all()
    )
    return partidas


@router.post("/{id_partida}/entrar", response_model=ParticipanteOut)
def join_partida(
    id_partida: int,
    db: DBSession,
    current_user: CurrentUser
):
    """
    Permite que o usuário logado entre em uma partida aberta.
    """
    
    partida = db.query(Partida).options(
        selectinload(Partida.participantes)
    ).filter(Partida.id_partida == id_partida).first()

    if not partida:
        raise HTTPException(status_code=404, detail="Partida não encontrada.")

    for p in partida.participantes:
        if p.id_usuario == current_user.id_usuario:
            raise HTTPException(
                status_code=409, 
                detail="Você já está nesta partida."
            )

    if len(partida.participantes) >= partida.limite_jogadores:
        raise HTTPException(
            status_code=403, 
            detail="Esta partida está cheia."
        )

    novo_participante = Participante(
        id_partida=id_partida,
        id_usuario=current_user.id_usuario,
        papel=PapelParticipante.jogador
    )
    
    db.add(novo_participante)
    db.commit()
    db.refresh(novo_participante) 
    
    db.refresh(novo_participante.usuario)
    
    return novo_participante


@router.delete("/{id_partida}/sair", status_code=status.HTTP_204_NO_CONTENT)
def leave_partida(
    id_partida: int,
    db: DBSession,
    current_user: CurrentUser
):
    """
    Remove o usuário logado de uma partida.
    """
    
    # 1. Encontrar o registro do participante
    participante = db.query(Participante).filter(
        Participante.id_partida == id_partida,
        Participante.id_usuario == current_user.id_usuario
    ).first()

    if not participante:
        raise HTTPException(
            status_code=404, 
            detail="Você não está nesta partida."
        )
    
    # --- PONTO CEGO DE LÓGICA DE NEGÓCIO ---
    # TODO: O que acontece se o 'organizador' sair?
    # A partida deve ser cancelada? O papel deve ser transferido?
    # Por enquanto, estamos permitindo que qualquer um saia.
    if participante.papel == PapelParticipante.organizador:
        # Aqui você pode adicionar uma lógica futura
        pass 

    db.delete(participante)
    db.commit()
    return None # Retorna 204 No Content