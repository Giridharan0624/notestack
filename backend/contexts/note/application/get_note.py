from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import NotFoundError


class GetNoteUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(self, user_id: str, note_id: str) -> Note:
        note = self.repository.find_by_id(user_id, note_id)
        if not note:
            raise NotFoundError(f"Note {note_id} not found")
        return note
