from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload
from sqlalchemy import func, case # Para contagem de vagas

# Importações de blocos de construção
from core.database import get_db
from models.quadras import (
    Agendamento, StatusAgendamento, 
    Partida, Participante, PapelParticipante
)
from models.user import Usuario
from schemas.quadras import PartidaCreate, PartidaOut, ParticipanteOut
from .deps import DBSession, CurrentUser

# A Rota para o núcleo do DVP (RF05)
router = APIRouter(prefix="/partidas", tags=["Partidas (Fecha Time)"])


@router.post(
    "/agendamento/{id_agendamento}", 
    response_model=PartidaOut, 
    status_code=status.HTTP_201_CREATED
)
def create_partida(
    id_agendamento: int,
    partida_in: PartidaCreate, # Pega o limite_jogadores e descrição
    db: DBSession,
    current_user: CurrentUser
):
    """
    Cria uma nova Partida Aberta (Fecha Time) a partir de um agendamento.
    
    - Requer que o agendamento esteja 'confirmado'.
    - Requer que o usuário logado seja o dono do agendamento.
    - Adiciona o usuário logado como o 'organizador' da partida.
    """
    
    # 1. Validação do Agendamento
    agendamento = db.query(Agendamento).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")
    
    # 2. Validação de Permissão (Só o dono do agendamento pode criar)
    if agendamento.id_usuario != current_user.id_usuario:
        raise HTTPException(
            status_code=403, 
            detail="Apenas o dono do agendamento pode criar uma partida."
        )

    # 3. Validação de Status (Só pode criar partida de agendamento confirmado)
    if agendamento.status != StatusAgendamento.confirmado:
        raise HTTPException(
            status_code=400, 
            detail="Apenas agendamentos 'confirmados' podem virar partidas."
        )
        
    # 4. Validação de Duplicidade
    if agendamento.partida:
        raise HTTPException(
            status_code=409, 
            detail="Este agendamento já possui uma partida associada."
        )

    # 5. Criar a Partida
    db_partida = Partida(
        **partida_in.model_dump(),
        id_agendamento=id_agendamento
    )
    
    # 6. Adicionar o criador como "Organizador"
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
    # Esta é uma query complexa.
    # 1. Conta quantos participantes cada partida tem.
    # 2. Compara com o 'limite_jogadores'
    # 3. Filtra apenas as que (participantes < limite)
    
    # Subquery para contar participantes
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
        # Otimiza o carregamento dos dados aninhados
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
    
    # 1. Carrega a partida e seus participantes (para contagem)
    partida = db.query(Partida).options(
        selectinload(Partida.participantes)
    ).filter(Partida.id_partida == id_partida).first()

    if not partida:
        raise HTTPException(status_code=404, detail="Partida não encontrada.")

    # 2. Validação de Lógica: O usuário já está na partida?
    for p in partida.participantes:
        if p.id_usuario == current_user.id_usuario:
            raise HTTPException(
                status_code=409, 
                detail="Você já está nesta partida."
            )

    # 3. Validação de Lógica: A partida está cheia? (A "Verdade")
    if len(partida.participantes) >= partida.limite_jogadores:
        raise HTTPException(
            status_code=403, 
            detail="Esta partida está cheia."
        )

    # 4. Adicionar o novo participante
    novo_participante = Participante(
        id_partida=id_partida,
        id_usuario=current_user.id_usuario,
        papel=PapelParticipante.jogador # O padrão
    )
    
    db.add(novo_participante)
    db.commit()
    db.refresh(novo_participante) # Refresh para carregar o 'usuario' (pelo lazy-load)
    
    # Precisamos carregar o 'usuario' para o schema de resposta
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