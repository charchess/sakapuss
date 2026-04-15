from functools import lru_cache
from typing import ClassVar

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "sakapuss"
    api_title: str = "Sakapuss API"
    db_path: str = "./data/sakapuss.db"
    media_path: str = "./media"
    mqtt_broker_host: str = ""
    mqtt_broker_port: int = 1883
    mqtt_username: str = ""
    mqtt_password: str = ""
    mqtt_discovery_prefix: str = "homeassistant"
    jwt_secret: str = "sakapuss-dev-secret-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expiry_days: int = 7

    model_config: ClassVar[SettingsConfigDict] = SettingsConfigDict(
        env_file=".env",
        env_prefix="SAKAPUSS_",
        case_sensitive=False,
        extra="ignore",
    )

    @computed_field(return_type=str)  # type: ignore[prop-decorator]
    @property
    def database_url(self) -> str:
        return f"sqlite+pysqlite:///{self.db_path}"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
