from typing import Annotated
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import ValidationError

from core.database import get_db
from core.security import verify_token
from models.user import Usuario, TipoUsuario
from schemas.token import TokenPayload

# O 'tokenUrl' aponta para a rota que *cria* o token (api/auth.py)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token/")

DBSession = Annotated[Session, Depends(get_db)]
Token = Annotated[str, Depends(oauth2_scheme)]

def get_current_user(token: Token, db: DBSession) -> Usuario:
    """
    Dependência principal: Valida o token e retorna o usuário do banco.
    Este é o "leitor de chaves" básico.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decodifica o token para pegar o payload
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
            
        email: str | None = payload.sub # Acessa o 'sub' do TokenPayload
        if email is None:
            raise credentials_exception
            
    except (ValidationError, AttributeError):
        raise credentials_exception
        
    user = db.query(Usuario).filter(Usuario.email == email).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuário do token não encontrado",
        )
    return user

CurrentUser = Annotated[Usuario, Depends(get_current_user)]

def get_current_dono_user(current_user: CurrentUser) -> Usuario:
    """
    Dependência de permissão:
    Exige que o usuário atual seja 'dono' ou 'admin'.
    """
    if current_user.tipo_usuario not in (TipoUsuario.dono, TipoUsuario.admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Requer permissão de 'Dono' ou 'Admin'",
        )
    return current_user

DonoUser = Annotated[Usuario, Depends(get_current_dono_user)]

def get_current_admin_user(current_user: CurrentUser) -> Usuario:
    """
    Dependência de permissão:
    Exige que o usuário atual seja 'admin'.
    """
    if current_user.tipo_usuario != TipoUsuario.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado: Requer permissão de 'Admin'",
        )
    return current_user

#AdminUser = Annotated[Usuario, Depends(get_current_admin_user)]