"""Application configuration via pydantic-settings. All secrets from env vars."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Groq
    groq_api_key: str = ""

    # Database
    database_url: str = "sqlite+aiosqlite:///./focusflow.db"

    # ChromaDB
    chroma_persist_dir: str = "./chroma_data"

    # Embedding model
    embedding_model: str = "all-MiniLM-L6-v2"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175"

    # Environment
    env: str = "development"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
