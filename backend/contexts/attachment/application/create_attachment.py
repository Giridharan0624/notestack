from contexts.attachment.domain.attachment_entity import Attachment
from contexts.attachment.domain.attachment_repository import AttachmentRepository
from contexts.shared.domain.exceptions import ValidationError


class CreateAttachmentUseCase:
    def __init__(self, repository: AttachmentRepository):
        self.repository = repository

    def execute(
        self,
        user_id: str,
        note_id: str,
        file_name: str,
        file_key: str,
        file_size: int = 0,
        content_type: str = "",
    ) -> Attachment:
        if not file_name or not file_key:
            raise ValidationError("File name and file key are required")

        attachment = Attachment(
            user_id=user_id,
            note_id=note_id,
            file_name=file_name,
            file_key=file_key,
            file_size=file_size,
            content_type=content_type,
        )
        self.repository.save(attachment)
        return attachment
