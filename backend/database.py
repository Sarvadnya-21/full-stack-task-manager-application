import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

# TiDB Cloud connection URL (NO ?ssl=true here)
SQLALCHEMY_DATABASE_URL = "mysql+pymysql://2QgbvpdT4isaReH.root:we6eoDydotZAxX9F@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/task_manager"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_recycle=3600,
    connect_args={
        "ssl": {}
    }
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()