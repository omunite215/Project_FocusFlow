"""FocusFlow — Application settings via pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Environment-based configuration. Never hardcode secrets."""

    groq_api_key: str = ""
    database_url: str = "sqlite:///./focusflow.db"
    chroma_persist_dir: str = "./chroma_data"
    embedding_model: str = "all-MiniLM-L6-v2"
    cors_origins: str = "http://localhost:5173,https://focusflow.vercel.app"
    env: str = "development"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
