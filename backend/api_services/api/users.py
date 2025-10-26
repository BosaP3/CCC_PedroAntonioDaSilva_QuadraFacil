from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import SessionLocal
from models.user import Usuario
from schemas.user import UserCreate, UserOut
from core.security import get_password_hash
from sqlalchemy.exc import IntegrityError

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """
    Cria um novo usuário no banco de dados.
    """

    hashed_password = get_password_hash(user.password)
    
    db_user = Usuario(
        email=user.email,
        nome=user.nome,
        hashed_password=hashed_password,
        tipo_usuario=user.tipo_usuario
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Usuário com este e-mail já existe.",
        )

@router.get("/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    """
    Obtém um usuário pelo ID.
    """
    db_user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário não encontrado."
        )
    return db_user

@router.get("/", response_model=List[UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Lista todos os usuários com paginação.
    """
    users = db.query(Usuario).offset(skip).limit(limit).all()
    return users

# TODO: Adicionar rotas PUT (update) e DELETE (delete)
