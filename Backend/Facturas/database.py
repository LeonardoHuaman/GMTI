from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://postgres:1234@localhost:5433/gmti"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def test_connection():
    try:
        engine = create_engine(DATABASE_URL)
        with engine.connect() as connection:
            result = connection.execute(text("SELECT version();"))
            print("Conexión exitosa:", result.fetchone())
    except Exception as e:
        print("Error al conectar con la base de datos:", e)

test_connection()
