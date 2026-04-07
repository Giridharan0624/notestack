from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import NotFoundError, ValidationError
from contexts.shared.domain.value_objects import now_iso


class UpdateNoteUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(
        self,
        user_id: str,
        note_id: str,
        title: str | None = None,
        content: str | None = None,
        description: str | None = None,
        subject: str | None = None,
        visibility: str | None = None,
    ) -> Note:
        note = self.repository.find_by_id(user_id, note_id)
        if not note:
            raise NotFoundError(f"Note {note_id} not found")

        if title is not None:
            if not title.strip():
                raise ValidationError("Title cannot be empty")
            note.title = title.strip()

        if content is not None:
            note.content = content

        if description is not None:
            if len(description) > 200:
                raise ValidationError("Description must be 200 characters or less")
            note.description = description.strip()

        if subject is not None:
            note.subject = subject.strip()

        if visibility is not None:
            if visibility not in ("public", "private"):
                raise ValidationError("Visibility must be 'public' or 'private'")
            note.visibility = visibility

        note.updated_at = now_iso()
        self.repository.save(note)
        return note
