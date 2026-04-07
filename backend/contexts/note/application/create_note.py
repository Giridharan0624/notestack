from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import ValidationError


VALID_VISIBILITIES = ("public", "private")


class CreateNoteUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(
        self,
        user_id: str,
        title: str,
        content: str = "",
        description: str = "",
        subject: str = "",
        visibility: str = "private",
        author_display_name: str = "",
    ) -> Note:
        if not title or not title.strip():
            raise ValidationError("Title is required")

        if visibility not in VALID_VISIBILITIES:
            raise ValidationError("Visibility must be 'public' or 'private'")

        if len(description) > 200:
            raise ValidationError("Description must be 200 characters or less")

        note = Note(
            user_id=user_id,
            title=title.strip(),
            content=content,
            description=description.strip(),
            subject=subject.strip(),
            visibility=visibility,
            author_display_name=author_display_name,
        )
        self.repository.save(note)
        return note
