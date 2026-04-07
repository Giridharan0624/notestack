from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import now_iso


class Profile(BaseModel):
    user_id: str
    display_name: str = ""
    university: str = ""
    bio: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": "PROFILE",
            "user_id": self.user_id,
            "display_name": self.display_name,
            "university": self.university,
            "bio": self.bio,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "entity_type": "PROFILE",
        }

    @classmethod
    def from_dynamo_item(cls, item: dict) -> "Profile":
        return cls(
            user_id=item["user_id"],
            display_name=item.get("display_name", ""),
            university=item.get("university", ""),
            bio=item.get("bio", ""),
            created_at=item.get("created_at", ""),
            updated_at=item.get("updated_at", ""),
        )

    def to_api_dict(self) -> dict:
        return {
            "userId": self.user_id,
            "displayName": self.display_name,
            "university": self.university,
            "bio": self.bio,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
