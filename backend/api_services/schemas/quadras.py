from pydantic import BaseModel
from datetime import datetime
from typing import List

from .user import UserOut
from models.quadras import StatusAgendamento, PapelParticipante

class EspacoBase(BaseModel):
    nome: str
    endereco: str | None = None
    valor_hora: float

class EspacoCreate(EspacoBase):
    pass

class EspacoUpdate(EspacoBase):
    pass

class EspacoOut(EspacoBase):
    id_espaco: int
    id_usuario: int
    criado_em: datetime
    dono: UserOut

    class Config:
        orm_mode = True

class AgendamentoBase(BaseModel):
    id_espaco: int
    data_hora: datetime

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoOut(AgendamentoBase):
    id_agendamento: int
    id_usuario: int
    status: StatusAgendamento 
    criado_em: datetime
    
    espaco: EspacoOut
    usuario: UserOut 

    class Config:
        orm_mode = True

class ParticipanteOut(BaseModel):
    """
    Descreve um participante em uma partida,
    incluindo seu papel.
    """
    papel: PapelParticipante
    usuario: UserOut 

    class Config:
        orm_mode = True


class PartidaBase(BaseModel):
    descricao: str | None = None
    regras: str | None = None

class PartidaCreate(PartidaBase):
    id_agendamento: int

class PartidaOut(PartidaBase):
    id_partida: int
    agendamento: AgendamentoOut
    participantes: List[ParticipanteOut] = []

    class Config:
        orm_mode = True

