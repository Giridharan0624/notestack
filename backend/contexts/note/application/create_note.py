from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import ValidationError


class CreateNoteUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(self, user_id: str, title: str, content: str = "") -> Note:
        if not title or not title.strip():
            raise ValidationError("Title is required")

        note = Note(user_id=user_id, title=title.strip(), content=content)
        self.repository.save(note)
        return note
