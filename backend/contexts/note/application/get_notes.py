from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository


class GetNotesUseCase:
    def __init__(self, repository: NoteRepository):
        self.repository = repository

    def execute(self, user_id: str) -> list[Note]:
        return self.repository.find_all_by_user(user_id)
