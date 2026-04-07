from contexts.shared.domain.exceptions import ValidationError, NotFoundError
from contexts.sharing.domain.entities import Share
from contexts.sharing.infrastructure.dynamo_sharing_repository import DynamoSharingRepository


class ShareNoteUseCase:
    def __init__(self, repo: DynamoSharingRepository):
        self.repo = repo

    def execute(self, sender_id: str, note_id: str, recipient_id: str) -> Share:
        if sender_id == recipient_id:
            raise ValidationError("Cannot share to yourself")

        # Look up note
        lookup = self.repo.find_note_lookup(note_id)
        if not lookup:
            # Try direct — sender might own a private note
            note = self.repo.find_note(sender_id, note_id)
            if not note:
                raise NotFoundError("Note not found")
            note_owner_id = sender_id
        else:
            note_owner_id = lookup["user_id"]
            note = self.repo.find_note(note_owner_id, note_id)
            if not note:
                raise NotFoundError("Note not found")

        # Only note owner can share private notes
        if note.get("visibility") != "public" and note_owner_id != sender_id:
            raise ValidationError("Cannot share a private note you don't own")

        # Get sender profile
        profile = self.repo.find_profile(sender_id)
        sender_name = profile.get("display_name", "Student") if profile else "Student"

        share = Share(
            sender_id=sender_id,
            sender_name=sender_name,
            recipient_id=recipient_id,
            note_id=note_id,
            note_title=note.get("title", ""),
            note_owner_id=note_owner_id,
        )
        self.repo.save_share(share)
        return share


class GetNotificationsUseCase:
    def __init__(self, repo: DynamoSharingRepository):
        self.repo = repo

    def execute(self, user_id: str) -> list[dict]:
        items = self.repo.find_notifications(user_id)
        return [{
            "shareId": i["share_id"],
            "sk": i["sk"],
            "senderId": i["sender_id"],
            "senderName": i.get("sender_name", ""),
            "noteId": i["note_id"],
            "noteTitle": i.get("note_title", ""),
            "read": i.get("read", False),
            "createdAt": i.get("created_at", ""),
        } for i in items]


class MarkReadUseCase:
    def __init__(self, repo: DynamoSharingRepository):
        self.repo = repo

    def execute(self, user_id: str, share_id: str) -> None:
        # Find the notification to get its sk
        items = self.repo.find_notifications(user_id, limit=100)
        for item in items:
            if item.get("share_id") == share_id:
                self.repo.mark_read(user_id, item["sk"])
                return
        raise NotFoundError("Notification not found")


class GetUnreadCountUseCase:
    def __init__(self, repo: DynamoSharingRepository):
        self.repo = repo

    def execute(self, user_id: str) -> int:
        return self.repo.count_unread(user_id)
