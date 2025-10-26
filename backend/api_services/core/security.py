from passlib.context import CryptContext
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from pydantic import ValidationError

from core.config import settings
from schemas.token import TokenPayload

# PASSWORD HASHING

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha em texto puro corresponde ao hash."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gera o hash de uma senha em texto puro."""
    return pwd_context.hash(password)

# JWT TOKEN MANAGEMENT
def create_access_token(data: dict) -> str:
    """
    Cria um novo token de acesso JWT.
    """
    to_encode = data.copy()
    
    # Tempo de expiração do token
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Gera o token
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

def verify_token(token: str) -> TokenPayload | None:
    """
    Verifica um token JWT e retorna o payload se for válido.
    """
    try:
        # Decodifica o token
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        
        token_data = TokenPayload(**payload)
        
        if token_data.exp is None or token_data.exp < datetime.now(timezone.utc):
            return None # Expirado
            
    except (JWTError, ValidationError):
        return None
        
    return token_data

