from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import generate_id, now_iso


class Attachment(BaseModel):
    user_id: str
    attachment_id: str = Field(default_factory=generate_id)
    note_id: str
    file_name: str
    file_key: str
    file_size: int = 0
    content_type: str = ""
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.user_id}",
            "sk": f"ATTACH#{self.attachment_id}",
            "gsi1pk": f"NOTE#{self.note_id}",
            "gsi1sk": f"ATTACH#{self.attachment_id}",
            "user_id": self.user_id,
            "attachment_id": self.attachment_id,
            "note_id": self.note_id,
            "file_name": self.file_name,
            "file_key": self.file_key,
            "file_size": self.file_size,
            "content_type": self.content_type,
            "created_at": self.created_at,
            "entity_type": "ATTACHMENT",
        }

    @classmethod
    def from_dynamo_item(cls, item: dict) -> "Attachment":
        return cls(
            user_id=item["user_id"],
            attachment_id=item["attachment_id"],
            note_id=item["note_id"],
            file_name=item["file_name"],
            file_key=item["file_key"],
            file_size=int(item.get("file_size", 0)),
            content_type=item.get("content_type", ""),
            created_at=item["created_at"],
        )

    def to_api_dict(self) -> dict:
        return {
            "attachmentId": self.attachment_id,
            "noteId": self.note_id,
            "fileName": self.file_name,
            "fileKey": self.file_key,
            "fileSize": self.file_size,
            "contentType": self.content_type,
            "createdAt": self.created_at,
        }
