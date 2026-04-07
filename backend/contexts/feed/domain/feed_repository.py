from abc import ABC, abstractmethod


class FeedRepository(ABC):
    @abstractmethod
    def find_public_notes(self, limit: int = 20, last_key: dict | None = None) -> tuple[list[dict], dict | None]:
        pass

    @abstractmethod
    def find_public_notes_by_user(self, user_id: str, limit: int = 20, last_key: dict | None = None) -> tuple[list[dict], dict | None]:
        pass

    @abstractmethod
    def find_note_lookup(self, note_id: str) -> dict | None:
        pass

    @abstractmethod
    def find_note_by_key(self, user_id: str, note_id: str) -> dict | None:
        pass
