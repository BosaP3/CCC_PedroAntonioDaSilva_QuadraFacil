from pydantic import BaseModel
from datetime import datetime

class Token(BaseModel):
    """
    Schema de resposta para o token de autenticação.
    Define a estrutura do JSON que será retornado no login.
    """
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    """
    Schema para o payload (conteúdo) dentro do token JWT.
    É usado pelo core.security para verificar um token.
    """
    sub: str | None = None 
    exp: datetime | None = None

