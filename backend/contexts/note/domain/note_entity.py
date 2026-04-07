from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import generate_id, now_iso


class Note(BaseModel):
    user_id: str
    note_id: str = Field(default_factory=generate_id)
    title: str
    content: str = ""
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": f"NOTE#{self.note_id}",
            "user_id": self.user_id,
            "note_id": self.note_id,
            "title": self.title,
            "content": self.content,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "entity_type": "NOTE",
        }

    @classmethod
    def from_dynamo_item(cls, item: dict) -> "Note":
        return cls(
            user_id=item["user_id"],
            note_id=item["note_id"],
            title=item["title"],
            content=item.get("content", ""),
            created_at=item["created_at"],
            updated_at=item["updated_at"],
        )

    def to_api_dict(self) -> dict:
        return {
            "noteId": self.note_id,
            "userId": self.user_id,
            "title": self.title,
            "content": self.content,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
