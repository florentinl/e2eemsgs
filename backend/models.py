from sqlmodel import Field, SQLModel, create_engine

DATABASE_URL = "sqlite:///./database"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


class User(SQLModel, table=True):
    id: int = Field(primary_key=True)
    username: str = Field()
    public_key: str = Field()
