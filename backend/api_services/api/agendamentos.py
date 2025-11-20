from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload, joinedload 
from datetime import datetime, timezone
from typing import Optional

from core.database import get_db
from models.quadras import Espaco, Agendamento, StatusAgendamento
from models.user import Usuario, TipoUsuario 
from schemas.quadras import AgendamentoCreate, AgendamentoOut

from .deps import DBSession, CurrentUser, DonoUser 


router = APIRouter(prefix="/agendamentos", tags=["Agendamentos"])


@router.post("/", response_model=AgendamentoOut, status_code=status.HTTP_201_CREATED)
def create_agendamento(
    agendamento_in: AgendamentoCreate,
    db: DBSession,
    current_user: CurrentUser 
):
    """
    Cria um novo agendamento para o usuário logado.

    Implementa lógica de negócio para validar:
    1. Se o espaço existe.
    2. Se o horário é no futuro.
    3. Se o horário já está ocupado.
    """

    db_espaco = db.query(Espaco).filter(Espaco.id_espaco == agendamento_in.id_espaco).first()
    if not db_espaco:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Espaço com id {agendamento_in.id_espaco} não encontrado",
        )

    if agendamento_in.data_hora <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não é possível agendar um horário no passado.",
        )

    conflito = db.query(Agendamento).filter(
        Agendamento.id_espaco == agendamento_in.id_espaco,
        Agendamento.data_hora == agendamento_in.data_hora,
        Agendamento.status == StatusAgendamento.confirmado
    ).first()

    if conflito:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este horário já está agendado e confirmado.",
        )

    db_agendamento = Agendamento(
        **agendamento_in.model_dump(),
        id_usuario=current_user.id_usuario,
        status=StatusAgendamento.pendente 
    )

    db.add(db_agendamento)
    db.commit()
    db.refresh(db_agendamento)

    return db_agendamento

@router.get("/espacos/{id_espaco}/confirmados", response_model=List[AgendamentoOut])
def list_agendamentos_confirmados_por_espaco(
    id_espaco: int,
    db: DBSession,
    data_inicio: Optional[datetime] = None,
    data_fim: Optional[datetime] = None,
):
    """
    Lista agendamentos CONFIRMADOS de um espaço específico.
    Útil para montar o calendário de disponibilidade no frontend.
    """
    espaco = db.query(Espaco).filter(Espaco.id_espaco == id_espaco).first()
    if not espaco:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espaço não encontrado",
        )

    query = db.query(Agendamento).filter(
        Agendamento.id_espaco == id_espaco,
        Agendamento.status == StatusAgendamento.confirmado
    )

    if data_inicio:
        query = query.filter(Agendamento.data_hora >= data_inicio)
    else:
        query = query.filter(Agendamento.data_hora >= datetime.now(timezone.utc))

    if data_fim:
        query = query.filter(Agendamento.data_hora <= data_fim)

    agendamentos = query.order_by(Agendamento.data_hora.asc()).all()
    
    return agendamentos

@router.get("/meus-agendamentos", response_model=List[AgendamentoOut])
def list_meus_agendamentos(
    db: DBSession,
    current_user: CurrentUser
):
    """
    Lista todos os agendamentos feitos pelo usuário logado.
    """
    agendamentos = db.query(Agendamento).filter(
        Agendamento.id_usuario == current_user.id_usuario
    ).order_by(Agendamento.data_hora.desc()).all()

    return agendamentos


# Rota para 'Donos' verem os agendamentos dos seus espaços.
@router.get("/espacos/meus", response_model=List[AgendamentoOut])
def list_agendamentos_dono(
    db: DBSession,
    current_user: DonoUser
):
    """
    Lista todos os agendamentos feitos nos espaços pertencentes ao dono logado.
    Requer permissão de 'dono' ou 'admin'.
    """
    agendamentos = db.query(Agendamento).join(Espaco).filter(
        Espaco.id_usuario == current_user.id_usuario
    ).options(
        selectinload(Agendamento.espaco).selectinload(Espaco.dono),
        selectinload(Agendamento.usuario)
    ).order_by(Agendamento.data_hora.desc()).all()

    return agendamentos


# Rota para 'Donos' mudarem o status
@router.patch("/{id_agendamento}/confirmar", response_model=AgendamentoOut)
def confirmar_agendamento(
    id_agendamento: int,
    db: DBSession,
    current_user: CurrentUser
):
    """
    Permite que o dono do espaço (ou admin) confirme um agendamento pendente.
    """
    agendamento = db.query(Agendamento).options(
        joinedload(Agendamento.espaco)
    ).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    is_owner = agendamento.espaco.id_usuario == current_user.id_usuario
    is_admin = current_user.tipo_usuario == TipoUsuario.admin

    if not is_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão para confirmar este agendamento.")

    if agendamento.status != StatusAgendamento.pendente:
        raise HTTPException(status_code=400, detail="Apenas agendamentos pendentes podem ser confirmados.")

    conflito = db.query(Agendamento).filter(
        Agendamento.id_espaco == agendamento.id_espaco,
        Agendamento.data_hora == agendamento.data_hora,
        Agendamento.status == StatusAgendamento.confirmado,
        Agendamento.id_agendamento != id_agendamento
    ).first()

    if conflito:
        raise HTTPException(
            status_code=409,
            detail="Este horário já está confirmado para outro agendamento."
        )

    agendamento.status = StatusAgendamento.confirmado
    db.commit()
    db.refresh(agendamento)
    return agendamento


# Rota para 'Clientes' ou 'Donos' cancelarem agendamentos.
@router.patch("/{id_agendamento}/cancelar", response_model=AgendamentoOut)
def cancelar_agendamento(
    id_agendamento: int,
    db: DBSession,
    current_user: CurrentUser
):
    """
    Permite que o usuário (cliente) cancele o próprio agendamento,
    ou que o dono do espaço cancele o agendamento.
    """
    agendamento = db.query(Agendamento).options(
        joinedload(Agendamento.espaco)
    ).filter(
        Agendamento.id_agendamento == id_agendamento
    ).first()

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    is_client_owner = agendamento.id_usuario == current_user.id_usuario
    is_espaco_owner = agendamento.espaco.id_usuario == current_user.id_usuario
    is_admin = current_user.tipo_usuario == TipoUsuario.admin

    if not is_client_owner and not is_espaco_owner and not is_admin:
        raise HTTPException(status_code=403, detail="Sem permissão para cancelar este agendamento.")

    if agendamento.status == StatusAgendamento.cancelado:
        raise HTTPException(status_code=400, detail="Este agendamento já foi cancelado.")

    agendamento.status = StatusAgendamento.cancelado
    db.commit()
    db.refresh(agendamento)
    return agendamento
