from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler
from contexts.upload.application.generate_upload_url import GenerateUploadUrlUseCase
from contexts.upload.infrastructure.s3_upload_service import S3UploadService

s3_service = S3UploadService()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    if method == "OPTIONS":
        return success_response("")
    if method == "POST" and resource == "/upload-url":
        return generate_upload_url(event, context)
    return error_response("Not found", 404)


@lambda_handler
def generate_upload_url(event, user_id, body, path_params, query_params):
    use_case = GenerateUploadUrlUseCase(s3_service)
    result = use_case.execute(
        user_id=user_id,
        note_id=body.get("noteId", ""),
        file_name=body.get("fileName", ""),
        content_type=body.get("contentType", ""),
    )
    return success_response(result)
