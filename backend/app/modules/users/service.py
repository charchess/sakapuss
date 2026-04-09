from sqlalchemy.orm import Session

from backend.app.modules.users.models import User


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def create_user(
    db: Session, email: str, hashed_password: str, display_name: str | None = None, language: str = "fr"
) -> User:
    user = User(
        email=email,
        hashed_password=hashed_password,
        display_name=display_name,
        language=language,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
