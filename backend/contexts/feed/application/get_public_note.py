from contexts.feed.domain.feed_repository import FeedRepository
from contexts.note.domain.note_entity import Note
from contexts.shared.domain.exceptions import NotFoundError


class GetPublicNoteUseCase:
    def __init__(self, repository: FeedRepository):
        self.repository = repository

    def execute(self, note_id: str) -> Note:
        lookup = self.repository.find_note_lookup(note_id)
        if not lookup:
            raise NotFoundError("Note not found")

        user_id = lookup["user_id"]
        item = self.repository.find_note_by_key(user_id, note_id)
        if not item:
            raise NotFoundError("Note not found")

        note = Note.from_dynamo_item(item)
        if note.visibility != "public":
            raise NotFoundError("Note not found")

        return note
