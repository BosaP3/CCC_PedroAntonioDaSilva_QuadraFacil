from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import IntegrityError, OperationalError
from core.database import engine, Base
import models.user
import models.quadras

from api import get_routers

# Cria as tabelas no banco
Base.metadata.create_all(bind=engine)   

app = FastAPI(
    title="Quadra Fácil API",
    description="API para o sistema de agendamento de quadras esportivas.",
    version="1.0.0"
)

# CORS
origins = [
    "http://localhost:3000", # TODO: ajustar
    "http://localhost:8080",
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware Tratamento de Erros
@app.middleware("http")
async def error_handling_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except IntegrityError as e:
        return JSONResponse(
            status_code=409,
            content={"detail": f"Erro de integridade de dados: {e.orig}"},
        )
    except OperationalError as e:
        return JSONResponse(
            status_code=503,
            content={"detail": f"Erro de conexão com o banco de dados: {e.orig}"},
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"detail": f"Um erro inesperado ocorreu: {str(e)}"},
        )
    

for router in get_routers():
    app.include_router(router)


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Bem-vindo à API do Quadra Fácil!"}