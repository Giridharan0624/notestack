from pydantic import BaseModel, EmailStr


class User(BaseModel):
    user_id: str
    email: str
    email_verified: bool = False

    def to_api_dict(self) -> dict:
        return {
            "userId": self.user_id,
            "email": self.email,
            "emailVerified": self.email_verified,
        }
