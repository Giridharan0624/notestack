from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import now_iso


class Follow(BaseModel):
    follower_id: str
    followee_id: str
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.follower_id}",
            "sk": f"FOLLOW#{self.followee_id}",
            "gsi1pk": f"FOLLOWERS#{self.followee_id}",
            "gsi1sk": f"{self.created_at}#{self.follower_id}",
            "follower_id": self.follower_id,
            "followee_id": self.followee_id,
            "created_at": self.created_at,
            "entity_type": "FOLLOW",
        }

    def to_api_dict(self) -> dict:
        return {
            "followerId": self.follower_id,
            "followeeId": self.followee_id,
            "createdAt": self.created_at,
        }


class Like(BaseModel):
    user_id: str
    note_id: str
    note_owner_id: str
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": f"LIKE#{self.note_id}",
            "gsi1pk": f"LIKES#{self.note_id}",
            "gsi1sk": f"{self.created_at}#{self.user_id}",
            "user_id": self.user_id,
            "note_id": self.note_id,
            "note_owner_id": self.note_owner_id,
            "created_at": self.created_at,
            "entity_type": "LIKE",
        }


class Bookmark(BaseModel):
    user_id: str
    note_id: str
    note_owner_id: str
    note_title: str = ""
    note_author_name: str = ""
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": f"BOOKMARK#{self.note_id}",
            "user_id": self.user_id,
            "note_id": self.note_id,
            "note_owner_id": self.note_owner_id,
            "note_title": self.note_title,
            "note_author_name": self.note_author_name,
            "created_at": self.created_at,
            "entity_type": "BOOKMARK",
        }

    def to_api_dict(self) -> dict:
        return {
            "noteId": self.note_id,
            "noteTitle": self.note_title,
            "noteAuthorName": self.note_author_name,
            "createdAt": self.created_at,
        }
