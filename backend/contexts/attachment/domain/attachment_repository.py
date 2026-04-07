from abc import ABC, abstractmethod

from contexts.attachment.domain.attachment_entity import Attachment


class AttachmentRepository(ABC):
    @abstractmethod
    def save(self, attachment: Attachment) -> None:
        pass

    @abstractmethod
    def find_by_note(self, note_id: str) -> list[Attachment]:
        pass

    @abstractmethod
    def find_by_id(self, user_id: str, attachment_id: str) -> Attachment | None:
        pass

    @abstractmethod
    def delete(self, user_id: str, attachment_id: str) -> None:
        pass
