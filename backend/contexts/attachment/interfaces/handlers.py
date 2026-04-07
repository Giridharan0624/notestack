from contexts.attachment.application.create_attachment import CreateAttachmentUseCase
from contexts.attachment.application.delete_attachment import DeleteAttachmentUseCase
from contexts.attachment.application.list_attachments import ListAttachmentsUseCase
from contexts.attachment.application.get_download_url import GetDownloadUrlUseCase
from contexts.attachment.infrastructure.dynamo_attachment_repository import DynamoAttachmentRepository
from contexts.attachment.infrastructure.s3_attachment_service import S3AttachmentService
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler

repo = DynamoAttachmentRepository()
s3_service = S3AttachmentService()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("POST", "/notes/{id}/attachments"): create_attachment,
        ("GET", "/notes/{id}/attachments"): list_attachments,
        ("DELETE", "/notes/{id}/attachments/{attachmentId}"): delete_attachment,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def create_attachment(event, user_id, body, path_params, query_params):
    use_case = CreateAttachmentUseCase(repo)
    attachment = use_case.execute(
        user_id=user_id,
        note_id=path_params.get("id", ""),
        file_name=body.get("fileName", ""),
        file_key=body.get("fileKey", ""),
        file_size=body.get("fileSize", 0),
        content_type=body.get("contentType", ""),
    )
    return success_response(attachment.to_api_dict(), 201)


@lambda_handler
def list_attachments(event, user_id, body, path_params, query_params):
    use_case = ListAttachmentsUseCase(repo)
    attachments = use_case.execute(note_id=path_params.get("id", ""))
    return success_response([a.to_api_dict() for a in attachments])


@lambda_handler
def delete_attachment(event, user_id, body, path_params, query_params):
    use_case = DeleteAttachmentUseCase(repo, s3_service)
    use_case.execute(user_id=user_id, attachment_id=path_params.get("attachmentId", ""))
    return success_response({"message": "Attachment deleted"})
