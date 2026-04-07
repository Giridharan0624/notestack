from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import now_iso


class Profile(BaseModel):
    user_id: str
    username: str = ""
    display_name: str = ""
    university: str = ""
    bio: str = ""
    avatar_url: str = ""
    year_of_study: str = ""
    major: str = ""
    social_links: dict[str, str] = Field(default_factory=dict)
    follower_count: int = 0
    following_count: int = 0
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": "PROFILE",
            "user_id": self.user_id,
            "username": self.username,
            "display_name": self.display_name,
            "university": self.university,
            "bio": self.bio,
            "avatar_url": self.avatar_url,
            "year_of_study": self.year_of_study,
            "major": self.major,
            "social_links": self.social_links,
            "follower_count": self.follower_count,
            "following_count": self.following_count,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "entity_type": "PROFILE",
        }

    @classmethod
    def from_dynamo_item(cls, item: dict) -> "Profile":
        return cls(
            user_id=item["user_id"],
            username=item.get("username", ""),
            display_name=item.get("display_name", ""),
            university=item.get("university", ""),
            bio=item.get("bio", ""),
            avatar_url=item.get("avatar_url", ""),
            year_of_study=item.get("year_of_study", ""),
            major=item.get("major", ""),
            social_links=item.get("social_links", {}),
            follower_count=int(item.get("follower_count", 0)),
            following_count=int(item.get("following_count", 0)),
            created_at=item.get("created_at", ""),
            updated_at=item.get("updated_at", ""),
        )

    def to_api_dict(self) -> dict:
        return {
            "userId": self.user_id,
            "username": self.username,
            "displayName": self.display_name,
            "university": self.university,
            "bio": self.bio,
            "avatarUrl": self.avatar_url,
            "yearOfStudy": self.year_of_study,
            "major": self.major,
            "socialLinks": self.social_links,
            "followerCount": self.follower_count,
            "followingCount": self.following_count,
            "joinDate": self.created_at,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
