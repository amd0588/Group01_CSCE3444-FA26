from sqlmodel import Field, SQLModel


#creates table task with these attributes
class Task(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    done: bool = False