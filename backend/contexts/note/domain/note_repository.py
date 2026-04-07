from abc import ABC, abstractmethod

from contexts.note.domain.note_entity import Note


class NoteRepository(ABC):
    @abstractmethod
    def save(self, note: Note) -> None:
        pass

    @abstractmethod
    def find_by_id(self, user_id: str, note_id: str) -> Note | None:
        pass

    @abstractmethod
    def find_all_by_user(self, user_id: str) -> list[Note]:
        pass

    @abstractmethod
    def find_public_by_user(self, user_id: str) -> list[Note]:
        pass

    @abstractmethod
    def delete(self, user_id: str, note_id: str) -> None:
        pass

    @abstractmethod
    def save_lookup(self, note: Note) -> None:
        pass

    @abstractmethod
    def delete_lookup(self, note_id: str) -> None:
        pass
