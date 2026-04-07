from contexts.attachment.domain.attachment_repository import AttachmentRepository
from contexts.attachment.infrastructure.s3_attachment_service import S3AttachmentService
from contexts.shared.domain.exceptions import NotFoundError


class DeleteAttachmentUseCase:
    def __init__(self, repository: AttachmentRepository, s3_service: S3AttachmentService):
        self.repository = repository
        self.s3_service = s3_service

    def execute(self, user_id: str, attachment_id: str) -> None:
        attachment = self.repository.find_by_id(user_id, attachment_id)
        if not attachment:
            raise NotFoundError(f"Attachment {attachment_id} not found")

        self.s3_service.delete_object(attachment.file_key)
        self.repository.delete(user_id, attachment_id)
