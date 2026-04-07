from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import generate_id, now_iso


class Share(BaseModel):
    share_id: str = Field(default_factory=generate_id)
    sender_id: str
    sender_name: str = ""
    recipient_id: str
    note_id: str
    note_title: str = ""
    note_owner_id: str = ""
    read: bool = False
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"USER#{self.recipient_id}",
            "sk": f"SHARE#{self.created_at}#{self.share_id}",
            "share_id": self.share_id,
            "sender_id": self.sender_id,
            "sender_name": self.sender_name,
            "recipient_id": self.recipient_id,
            "note_id": self.note_id,
            "note_title": self.note_title,
            "note_owner_id": self.note_owner_id,
            "read": self.read,
            "created_at": self.created_at,
            "entity_type": "SHARE",
        }

    def to_api_dict(self) -> dict:
        return {
            "shareId": self.share_id,
            "senderId": self.sender_id,
            "senderName": self.sender_name,
            "noteId": self.note_id,
            "noteTitle": self.note_title,
            "read": self.read,
            "createdAt": self.created_at,
        }
