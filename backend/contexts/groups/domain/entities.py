from pydantic import BaseModel, Field

from contexts.shared.domain.value_objects import generate_id, now_iso


class Group(BaseModel):
    group_id: str = Field(default_factory=generate_id)
    name: str
    creator_id: str
    member_count: int = 1
    created_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"GROUP#{self.group_id}",
            "sk": "META",
            "group_id": self.group_id,
            "name": self.name,
            "creator_id": self.creator_id,
            "member_count": self.member_count,
            "created_at": self.created_at,
            "entity_type": "GROUP",
        }

    def to_api_dict(self) -> dict:
        return {
            "groupId": self.group_id,
            "name": self.name,
            "creatorId": self.creator_id,
            "memberCount": self.member_count,
            "createdAt": self.created_at,
        }


class GroupMember(BaseModel):
    group_id: str
    user_id: str
    display_name: str = ""
    role: str = "member"
    joined_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"GROUP#{self.group_id}",
            "sk": f"MEMBER#{self.user_id}",
            "gsi1pk": f"USERGROUPS#{self.user_id}",
            "gsi1sk": f"{self.joined_at}#{self.group_id}",
            "group_id": self.group_id,
            "user_id": self.user_id,
            "display_name": self.display_name,
            "role": self.role,
            "joined_at": self.joined_at,
            "entity_type": "GROUP_MEMBER",
        }

    def to_api_dict(self) -> dict:
        return {
            "userId": self.user_id,
            "displayName": self.display_name,
            "role": self.role,
            "joinedAt": self.joined_at,
        }


class GroupNote(BaseModel):
    group_id: str
    note_id: str
    note_title: str = ""
    note_owner_id: str = ""
    shared_by: str = ""
    shared_by_name: str = ""
    shared_at: str = Field(default_factory=now_iso)

    def to_dynamo_item(self) -> dict:
        return {
            "pk": f"GROUP#{self.group_id}",
            "sk": f"NOTE#{self.shared_at}#{self.note_id}",
            "group_id": self.group_id,
            "note_id": self.note_id,
            "note_title": self.note_title,
            "note_owner_id": self.note_owner_id,
            "shared_by": self.shared_by,
            "shared_by_name": self.shared_by_name,
            "shared_at": self.shared_at,
            "entity_type": "GROUP_NOTE",
        }

    def to_api_dict(self) -> dict:
        return {
            "noteId": self.note_id,
            "noteTitle": self.note_title,
            "noteOwnerId": self.note_owner_id,
            "sharedBy": self.shared_by,
            "sharedByName": self.shared_by_name,
            "sharedAt": self.shared_at,
        }
