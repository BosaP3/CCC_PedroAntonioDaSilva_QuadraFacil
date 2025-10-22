from datetime import datetime, timedelta
from time import timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext

from ..core.config import Settings

from ..schemas.user import UserCreate, UserOut
from ..models.user import User
from ..core.database import SessionLocal, engine

User.metadata.create_all(bind=engine)

router = APIRouter(
    prefix="/auth",
    tags=["Autenticação"]
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/cadastro", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email já cadastrado.")

    hashed_password = pwd_context.hash(user.password)

    new_user = User(
        nome=user.nome,
        email=user.email,
        telefone=user.telefone,
        hashed_password=hashed_password,
        tipo_perfil=user.tipo_perfil
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.post("/login")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expire = datetime.now(timezone.utc) + timedelta(minutes=Settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": user.email,      # 'subject' do token
        "user_id": user.id,     
        "exp": expire,          
    }

    access_token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM) # pyright: ignore[reportUndefinedVariable]

    return {"access_token": access_token, "token_type": "bearer"}