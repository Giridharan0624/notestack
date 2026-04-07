from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import generate_id, now_iso


class Note(BaseModel):
    user_id: str
    note_id: str = Field(default_factory=generate_id)
    title: str
    content: str = ""
    description: str = ""
    tags: list[str] = Field(default_factory=list)
    visibility: str = "private"
    author_display_name: str = ""
    pinned: bool = False
    like_count: int = 0
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        item = {
            "pk": f"USER#{self.user_id}",
            "sk": f"NOTE#{self.note_id}",
            "user_id": self.user_id,
            "note_id": self.note_id,
            "title": self.title,
            "content": self.content,
            "description": self.description,
            "tags": self.tags,
            "visibility": self.visibility,
            "author_display_name": self.author_display_name,
            "pinned": self.pinned,
            "like_count": self.like_count,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "entity_type": "NOTE",
        }
        if self.visibility == "public":
            item["gsi2pk"] = "FEED#PUBLIC"
            item["gsi2sk"] = f"{self.created_at}#{self.note_id}"
        return item

    def to_lookup_item(self) -> dict:
        return {
            "pk": f"NOTE#{self.note_id}",
            "sk": "LOOKUP",
            "user_id": self.user_id,
            "entity_type": "NOTE_LOOKUP",
        }

    @classmethod
    def from_dynamo_item(cls, item: dict) -> "Note":
        return cls(
            user_id=item["user_id"],
            note_id=item["note_id"],
            title=item["title"],
            content=item.get("content", ""),
            description=item.get("description", ""),
            tags=item.get("tags", []),
            visibility=item.get("visibility", "private"),
            author_display_name=item.get("author_display_name", ""),
            pinned=item.get("pinned", False),
            like_count=int(item.get("like_count", 0)),
            created_at=item["created_at"],
            updated_at=item["updated_at"],
        )

    def to_api_dict(self) -> dict:
        return {
            "noteId": self.note_id,
            "userId": self.user_id,
            "title": self.title,
            "content": self.content,
            "description": self.description,
            "tags": self.tags,
            "visibility": self.visibility,
            "authorDisplayName": self.author_display_name,
            "pinned": self.pinned,
            "likeCount": self.like_count,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
