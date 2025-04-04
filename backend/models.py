from sqlmodel import Field, SQLModel, create_engine

DATABASE_URL = "sqlite:///./database"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=8, unique=True)
    public_key: str = Field(min_length=1)


class Challenge(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(min_length=8)
    challenge: str = Field()
