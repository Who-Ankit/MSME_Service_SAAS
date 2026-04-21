import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker


ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")

database_url = os.getenv("DATABASE_URL", "sqlite:///./leads.db")
if database_url.startswith("sqlite:///./"):
    sqlite_relative_path = database_url.removeprefix("sqlite:///./")
    database_url = f"sqlite:///{(ROOT_DIR / sqlite_relative_path).resolve().as_posix()}"

connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}

engine = create_engine(database_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def ensure_leads_table_columns() -> None:
    if not database_url.startswith("sqlite"):
        return

    expected_columns = {
        "phone": "ALTER TABLE leads ADD COLUMN phone VARCHAR(50)",
        "budget": "ALTER TABLE leads ADD COLUMN budget VARCHAR(50)",
        "intent": "ALTER TABLE leads ADD COLUMN intent VARCHAR(50)",
        "source": "ALTER TABLE leads ADD COLUMN source VARCHAR(50) DEFAULT 'portal'",
    }

    with engine.begin() as connection:
        inspector = inspect(connection)
        if "leads" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("leads")}
        for column_name, statement in expected_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))

        index_statements = [
            "CREATE INDEX IF NOT EXISTS ix_leads_created_at ON leads (created_at)",
            "CREATE INDEX IF NOT EXISTS ix_leads_email ON leads (email)",
            "CREATE INDEX IF NOT EXISTS ix_leads_stage ON leads (stage)",
            "CREATE INDEX IF NOT EXISTS ix_leads_source ON leads (source)",
            "CREATE INDEX IF NOT EXISTS ix_leads_name ON leads (name)",
        ]
        for statement in index_statements:
            connection.execute(text(statement))


def ensure_services_table_indexes() -> None:
    if not database_url.startswith("sqlite"):
        return

    with engine.begin() as connection:
        inspector = inspect(connection)
        if "services" not in inspector.get_table_names():
            return

        expected_columns = {
            "image_path": "ALTER TABLE services ADD COLUMN image_path VARCHAR(500)",
        }
        existing_columns = {column["name"] for column in inspector.get_columns("services")}
        for column_name, statement in expected_columns.items():
            if column_name not in existing_columns:
                connection.execute(text(statement))

        index_statements = [
            "CREATE INDEX IF NOT EXISTS ix_services_created_at ON services (created_at)",
            "CREATE INDEX IF NOT EXISTS ix_services_title ON services (title)",
            "CREATE INDEX IF NOT EXISTS ix_services_slug ON services (slug)",
            "CREATE INDEX IF NOT EXISTS ix_services_is_active ON services (is_active)",
        ]
        for statement in index_statements:
            connection.execute(text(statement))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
