from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Annotated

# Imports de dependência
from core.database import get_db
from core.security import verify_password, create_access_token # <--- Importa da ferramentaria
from models.user import Usuario
from schemas.token import Token # <--- Importa do design

# Renomeei a variável do form para ser mais clara
OAuthForm = Annotated[OAuth2PasswordRequestForm, Depends()]
DBSession = Annotated[Session, Depends(get_db)]

router = APIRouter(prefix="/token", tags=["Auth"])


@router.post("/", response_model=Token)
def login_for_access_token(form_data: OAuthForm, db: DBSession):
    """
    Autentica o usuário e retorna um token JWT.

    Note que esta rota usa `application/x-www-form-urlencoded`, não JSON.

    - **username**: O email do usuário
    - **password**: A senha do usuário
    """
    
    user = db.query(Usuario).filter(Usuario.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # O 'sub' (subject) do token é o email do usuário
    access_token = create_access_token(data={"sub": user.email})

    return {"access_token": access_token, "token_type": "bearer"}

