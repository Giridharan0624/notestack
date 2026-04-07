from contexts.shared.domain.value_objects import generate_id
from contexts.upload.domain.upload_policy import validate_upload
from contexts.upload.infrastructure.s3_upload_service import S3UploadService


class GenerateUploadUrlUseCase:
    def __init__(self, s3_service: S3UploadService):
        self.s3_service = s3_service

    def execute(
        self, user_id: str, note_id: str, file_name: str, content_type: str
    ) -> dict:
        validate_upload(file_name, content_type)

        file_key = f"users/{user_id}/notes/{note_id}/{generate_id()}_{file_name}"
        upload_url = self.s3_service.generate_presigned_url(file_key, content_type)

        return {
            "uploadUrl": upload_url,
            "fileKey": file_key,
        }
