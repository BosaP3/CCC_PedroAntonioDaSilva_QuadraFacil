from typing import Annotated, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import selectinload # Para otimizar a consulta

from core.database import get_db
from models.quadras import Espaco
from models.user import Usuario
from schemas.quadras import EspacoCreate, EspacoOut
from .deps import DBSession, DonoUser, CurrentUser

router = APIRouter(prefix="/espacos", tags=["Espaços"])

@router.post("/", response_model=EspacoOut, status_code=status.HTTP_201_CREATED)
def create_espaco(
    espaco_in: EspacoCreate, 
    db: DBSession,
    current_user: DonoUser
):
    """
    Cria um novo espaço.
    
    Esta rota é protegida e requer permissão de 'dono' ou 'admin'.
    O espaço criado será automaticamente associado ao usuário logado.
    """

    db_espaco = Espaco(
        **espaco_in.model_dump(), 
        id_usuario=current_user.id_usuario
    )
    
    db.add(db_espaco)
    db.commit()
    db.refresh(db_espaco)
    return db_espaco

@router.get("/meus-espacos", response_model=List[EspacoOut])
def list_meus_espacos(
    db: DBSession,
    current_user: DonoUser
):
    """
    Lista todos os espaços que pertencem ao 'dono' logado.
    """
    espacos = db.query(Espaco).filter(
        Espaco.id_usuario == current_user.id_usuario
    ).all()
    
    return espacos

@router.get("/", response_model=List[EspacoOut])
def list_espacos(db: DBSession):
    """
    Lista TODOS os espaços cadastrados. Rota pública para descoberta.
    """
    espacos = db.query(Espaco).options(selectinload(Espaco.dono)).all()
    return espacos

@router.get("/{espaco_id}", response_model=EspacoOut)
def get_espaco(espaco_id: int, db: DBSession):
    """
    Obtém um espaço específico pelo ID. Rota pública.
    """
    espaco = db.query(Espaco).options(
        selectinload(Espaco.dono)
    ).filter(Espaco.id_espaco == espaco_id).first()
    
    if not espaco:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espaço não encontrado",
        )
    return espaco

# TODO: Adicionar rotas PUT e DELETE
# lógica extra para verificar se o usuário é dono do espaço.