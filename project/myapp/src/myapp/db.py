from sqlmodel import SQLModel, create_engine

engine = create_engine("sqlite:///app.db")

#starts and initializes the database tables using engine
def init_db():
    from . import models  #registers the models
    SQLModel.metadata.create_all(engine)