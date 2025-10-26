from pydantic import BaseModel, EmailStr
from datetime import datetime
from models.user import UserRole

class UserBase(BaseModel):
    email: EmailStr
    nome: str

class UserCreate(UserBase):
    password: str
    tipo_usuario: UserRole = UserRole.cliente

class UserOut(UserBase):
    id: int
    tipo_usuario: UserRole
    criado_em: datetime

    class Config:
        from_attributes = True 
