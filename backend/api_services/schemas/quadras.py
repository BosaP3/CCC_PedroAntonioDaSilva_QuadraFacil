from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List, Optional
from models.quadras import StatusAgendamento, PapelParticipante
from .user import UserOut 

class EspacoBase(BaseModel):
    nome: str
    endereco: Optional[str] = None
    valor_hora: float

class EspacoCreate(EspacoBase):
    pass

class EspacoUpdate(EspacoBase):
    pass

class EspacoOut(EspacoBase):
    id_espaco: int
    id_usuario: int
    dono: UserOut
    
    model_config= ConfigDict(from_attributes=True)

class AgendamentoBase(BaseModel):
    id_espaco: int
    data_hora: datetime

class AgendamentoCreate(AgendamentoBase):
    pass

class AgendamentoOut(AgendamentoBase):
    id_agendamento: int
    id_usuario: int
    status: StatusAgendamento
    
    espaco: EspacoOut 
    usuario: UserOut 

    model_config = ConfigDict(from_attributes=True)

class ParticipanteOut(BaseModel):
    id_usuario: int
    papel: PapelParticipante
    usuario: UserOut

    model_config = ConfigDict(from_attributes=True)


class PartidaBase(BaseModel):
    descricao: Optional[str] = None
    regras: Optional[str] = None
    limite_jogadores: int 

class PartidaCreate(PartidaBase):
    pass 

class PartidaOut(PartidaBase):
    id_partida: int
    id_agendamento: int
    
    agendamento: AgendamentoOut
    participantes: List[ParticipanteOut] = []

    model_config = ConfigDict(from_attributes=True)