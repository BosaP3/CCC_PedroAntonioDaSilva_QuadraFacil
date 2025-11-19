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

@router.put("/{espaco_id}", response_model=EspacoOut)
def update_espaco(
    espaco_id: int,
    espaco_in: EspacoCreate,
    db: DBSession,
    current_user: DonoUser
):
    """
    Atualiza os dados de um espaço existente.
    
    Regra de Negócio:
    - Apenas o DONO do espaço pode alterá-lo.
    """
    db_espaco = db.query(Espaco).filter(Espaco.id_espaco == espaco_id).first()

    if not db_espaco:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espaço não encontrado",
        )


    if db_espaco.id_usuario != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para editar este espaço."
        )

    update_data = espaco_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_espaco, key, value)

    db.add(db_espaco)
    db.commit()
    db.refresh(db_espaco)
    
    return db_espaco

@router.delete("/{espaco_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_espaco(
    espaco_id: int,
    db: DBSession,
    current_user: DonoUser
):
    """
    Remove um espaço do sistema.
    
    Regra de Negócio:
    - Apenas o DONO do espaço pode deletá-lo.
    """
    db_espaco = db.query(Espaco).filter(Espaco.id_espaco == espaco_id).first()

    if not db_espaco:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Espaço não encontrado",
        )

    if db_espaco.id_usuario != current_user.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Você não tem permissão para excluir este espaço."
        )

    db.delete(db_espaco)
    db.commit()
    
    return db_espaco