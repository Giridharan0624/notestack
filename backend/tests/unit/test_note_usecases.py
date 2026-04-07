import pytest

from contexts.note.application.create_note import CreateNoteUseCase
from contexts.note.application.delete_note import DeleteNoteUseCase
from contexts.note.application.get_note import GetNoteUseCase
from contexts.note.application.get_notes import GetNotesUseCase
from contexts.note.application.update_note import UpdateNoteUseCase
from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.domain.exceptions import NotFoundError, ValidationError


class InMemoryNoteRepository(NoteRepository):
    def __init__(self):
        self.notes: dict[str, Note] = {}

    def save(self, note: Note) -> None:
        self.notes[f"{note.user_id}:{note.note_id}"] = note

    def find_by_id(self, user_id: str, note_id: str) -> Note | None:
        return self.notes.get(f"{user_id}:{note_id}")

    def find_all_by_user(self, user_id: str) -> list[Note]:
        return [n for n in self.notes.values() if n.user_id == user_id]

    def find_public_by_user(self, user_id: str) -> list[Note]:
        return [n for n in self.notes.values() if n.user_id == user_id and n.visibility == "public"]

    def delete(self, user_id: str, note_id: str) -> None:
        self.notes.pop(f"{user_id}:{note_id}", None)

    def save_lookup(self, note: Note) -> None:
        pass

    def delete_lookup(self, note_id: str) -> None:
        pass


@pytest.fixture
def repo():
    return InMemoryNoteRepository()


def test_create_note(repo):
    uc = CreateNoteUseCase(repo)
    note = uc.execute("user-1", "My Note", "Content here")
    assert note.title == "My Note"
    assert note.content == "Content here"
    assert note.user_id == "user-1"
    assert len(repo.notes) == 1


def test_create_note_empty_title_raises(repo):
    uc = CreateNoteUseCase(repo)
    with pytest.raises(ValidationError):
        uc.execute("user-1", "", "Content")


def test_get_notes(repo):
    create = CreateNoteUseCase(repo)
    create.execute("user-1", "Note 1")
    create.execute("user-1", "Note 2")
    create.execute("user-2", "Other Note")

    uc = GetNotesUseCase(repo)
    notes = uc.execute("user-1")
    assert len(notes) == 2


def test_get_note(repo):
    create = CreateNoteUseCase(repo)
    created = create.execute("user-1", "My Note")

    uc = GetNoteUseCase(repo)
    note = uc.execute("user-1", created.note_id)
    assert note.title == "My Note"


def test_get_note_not_found(repo):
    uc = GetNoteUseCase(repo)
    with pytest.raises(NotFoundError):
        uc.execute("user-1", "nonexistent")


def test_update_note(repo):
    create = CreateNoteUseCase(repo)
    created = create.execute("user-1", "Original")

    uc = UpdateNoteUseCase(repo)
    updated = uc.execute("user-1", created.note_id, title="Updated")
    assert updated.title == "Updated"


def test_update_note_not_found(repo):
    uc = UpdateNoteUseCase(repo)
    with pytest.raises(NotFoundError):
        uc.execute("user-1", "nonexistent", title="X")


def test_delete_note(repo):
    create = CreateNoteUseCase(repo)
    created = create.execute("user-1", "To Delete")

    uc = DeleteNoteUseCase(repo)
    uc.execute("user-1", created.note_id)
    assert len(repo.notes) == 0


def test_delete_note_not_found(repo):
    uc = DeleteNoteUseCase(repo)
    with pytest.raises(NotFoundError):
        uc.execute("user-1", "nonexistent")
