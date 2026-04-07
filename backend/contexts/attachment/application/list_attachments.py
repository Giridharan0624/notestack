from contexts.attachment.domain.attachment_entity import Attachment
from contexts.attachment.domain.attachment_repository import AttachmentRepository


class ListAttachmentsUseCase:
    def __init__(self, repository: AttachmentRepository):
        self.repository = repository

    def execute(self, note_id: str) -> list[Attachment]:
        return self.repository.find_by_note(note_id)
