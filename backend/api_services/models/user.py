import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from core.database import Base

class UserRole(enum.Enum):
    admin = "admin"
    cliente = "cliente"
    dono = "dono"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True) 
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    tipo_usuario = Column(Enum(UserRole), nullable=False, default=UserRole.cliente)
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    # TODO: Adicionar os relacionamentos quando criar outras tabelas
    # quadras = relationship("Quadra", back_populates="proprietario")
