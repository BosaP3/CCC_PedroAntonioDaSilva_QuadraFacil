from pydantic import BaseModel, EmailStr
from datetime import datetime
from models.user import TipoUsuario


class UserBase(BaseModel):
    email: EmailStr
    nome: str

class UserCreate(UserBase):
    password: str
    tipo_usuario: TipoUsuario = TipoUsuario.cliente

class UserOut(UserBase):
    id_usuario: int
    tipo_usuario: TipoUsuario
    criado_em: datetime

    class Config:
        from_attributes = True