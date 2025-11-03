import enum
from sqlalchemy import Column, Integer, String, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from core.database import Base

class TipoUsuario(str, enum.Enum):
    admin = "admin"
    cliente = "cliente"
    dono = "dono"

class Usuario(Base):
    __tablename__ = 'usuarios'
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    tipo_usuario = Column(SAEnum(TipoUsuario), nullable=False, default=TipoUsuario.cliente)

    espacos = relationship('Espaco', back_populates='dono', lazy='selectin')
    
  
    agendamentos = relationship('Agendamento', back_populates='usuario', lazy='selectin')
    
    partidas = relationship(
        'Participante',
        back_populates='usuario',
        lazy='selectin'
    )

