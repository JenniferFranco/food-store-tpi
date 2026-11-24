from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Variables de entorno leídas del archivo .env."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./foodstore.db"
    SECRET_KEY: str = "cambiar-esta-clave-de-al-menos-32-caracteres"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @property
    def cors_origins(self) -> list[str]:
        return [origen.strip() for origen in self.FRONTEND_ORIGIN.split(",") if origen.strip()]


settings = Settings()
