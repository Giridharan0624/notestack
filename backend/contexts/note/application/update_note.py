from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import NotFoundError, ValidationError
from contexts.shared.domain.value_objects import now_iso


class UpdateNoteUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(self, user_id: str, note_id: str, title: str | None = None, content: str | None = None) -> Note:
        note = self.repository.find_by_id(user_id, note_id)
        if not note:
            raise NotFoundError(f"Note {note_id} not found")

        if title is not None:
            if not title.strip():
                raise ValidationError("Title cannot be empty")
            note.title = title.strip()

        if content is not None:
            note.content = content

        note.updated_at = now_iso()
        self.repository.save(note)
        return note
