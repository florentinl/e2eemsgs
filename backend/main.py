from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker,Session
from fastapi import FastAPI,Depends
from pydantic import BaseModel

DATABASE_URL = "sqlite:///./database"

app = FastAPI()

engine = create_engine(DATABASE_URL,connect_args={"check_same_thread":False})
SessionLocal = sessionmaker(autocommit=False,autoflush=False,bind=engine)


Base = declarative_base()
    
class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key=True, index=True)
    username = Column(String,index=True)
    public_key = Column(String,index=True)

Base.metadata.create_all(bind=engine)




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserCreate(BaseModel):
    username: str
    public_key: str

@app.post("/users/",response_model=int)
def create_user(user:UserCreate,db: Session = Depends(get_db)):
    new_user = User(username = user.username, public_key = user.public_key)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user.id