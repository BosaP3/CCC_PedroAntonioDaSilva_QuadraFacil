import enum
from sqlalchemy import (
    Column, Integer, String, DateTime, Enum as SAEnum, 
    ForeignKey, Table, Float, CheckConstraint
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base

class StatusAgendamento(str, enum.Enum):
    pendente = "pendente"
    confirmado = "confirmado"
    cancelado = "cancelado"

class PapelParticipante(str, enum.Enum):
    organizador = "organizador"
    jogador = "jogador"
    convidado = "convidado"

class Espaco(Base):
    __tablename__ = 'espacos'
    
    id_espaco = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
    nome = Column(String(100), nullable=False)
    endereco = Column(String(255))
    valor_hora = Column(Float, nullable=False)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    dono = relationship('Usuario', back_populates='espacos', lazy='selectin')
    agendamentos = relationship('Agendamento', back_populates='espaco', cascade="all, delete-orphan", lazy='selectin')

class Agendamento(Base):
    __tablename__ = 'agendamentos'
    
    id_agendamento = Column(Integer, primary_key=True, index=True)
    id_espaco = Column(Integer, ForeignKey('espacos.id_espaco'), nullable=False)
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), nullable=False)
    data_hora = Column(DateTime(timezone=True), nullable=False)
    status = Column(SAEnum(StatusAgendamento), nullable=False, default=StatusAgendamento.pendente)
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamento de volta para o Espaco
    espaco = relationship('Espaco', back_populates='agendamentos', lazy='selectin')
    # Relacionamento de volta para o Usuario que agendou
    usuario = relationship('Usuario', back_populates='agendamentos', lazy='selectin')
    # Relacionamento para a partida (se houver)
    partida = relationship('Partida', back_populates='agendamento', uselist=False, cascade="all, delete-orphan", lazy='selectin')

class Partida(Base):
    __tablename__ = 'partidas'
    
    id_partida = Column(Integer, primary_key=True, index=True)
    id_agendamento = Column(Integer, ForeignKey('agendamentos.id_agendamento'), unique=True, nullable=False)
    limite_jogadores = Column(Integer, CheckConstraint('limite_jogadores > 0'), nullable=False)
    
    descricao = Column(String(255))
    regras = Column(String(1000))
    
    # Relacionamento de volta para o Agendamento
    agendamento = relationship('Agendamento', back_populates='partida', lazy='selectin')
    
    # Relacionamento para os participantes (usando o Objeto de Associação)
    participantes = relationship('Participante', back_populates='partida', cascade="all, delete-orphan", lazy='selectin')

class Participante(Base):
    __tablename__ = 'participantes_partida'
    
    id_partida = Column(Integer, ForeignKey('partidas.id_partida'), primary_key=True)
    id_usuario = Column(Integer, ForeignKey('usuarios.id_usuario'), primary_key=True)
    papel = Column(SAEnum(PapelParticipante), nullable=False, default=PapelParticipante.jogador)
    
    # Relacionamentos para as "mães"
    partida = relationship('Partida', back_populates='participantes', lazy='selectin')
    usuario = relationship('Usuario', back_populates='partidas', lazy='selectin')