import os

import boto3

from contexts.feed.application.get_feed import GetFeedUseCase
from contexts.feed.application.get_public_note import GetPublicNoteUseCase
from contexts.feed.application.get_user_notes import GetUserPublicNotesUseCase
from contexts.feed.infrastructure.dynamo_feed_repository import DynamoFeedRepository
from contexts.attachment.infrastructure.dynamo_attachment_repository import DynamoAttachmentRepository
from contexts.attachment.infrastructure.s3_attachment_service import S3AttachmentService
from contexts.attachment.domain.attachment_entity import Attachment
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import public_lambda_handler

repo = DynamoFeedRepository()
att_repo = DynamoAttachmentRepository()
s3_service = S3AttachmentService()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("GET", "/feed"): get_feed,
        ("GET", "/feed/notes/{noteId}"): get_public_note,
        ("GET", "/feed/notes/{noteId}/attachments"): get_public_attachments,
        ("GET", "/feed/notes/{noteId}/attachments/{attachmentId}/download"): get_public_download,
        ("GET", "/users/{userId}/notes"): get_user_notes,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@public_lambda_handler
def get_feed(event, user_id, body, path_params, query_params):
    use_case = GetFeedUseCase(repo)
    limit = int(query_params.get("limit", "20"))
    cursor = query_params.get("cursor")
    result = use_case.execute(limit=min(limit, 50), cursor=cursor)
    return success_response(result)


@public_lambda_handler
def get_public_note(event, user_id, body, path_params, query_params):
    use_case = GetPublicNoteUseCase(repo)
    note = use_case.execute(note_id=path_params.get("noteId", ""))
    return success_response(note.to_api_dict())


@public_lambda_handler
def get_public_attachments(event, user_id, body, path_params, query_params):
    note_id = path_params.get("noteId", "")
    # Verify the note is public
    lookup = repo.find_note_lookup(note_id)
    if not lookup:
        return error_response("Note not found", 404)
    attachments = att_repo.find_by_note(note_id)
    return success_response([a.to_api_dict() for a in attachments])


@public_lambda_handler
def get_public_download(event, user_id, body, path_params, query_params):
    note_id = path_params.get("noteId", "")
    attachment_id = path_params.get("attachmentId", "")
    # Verify the note is public
    lookup = repo.find_note_lookup(note_id)
    if not lookup:
        return error_response("Note not found", 404)
    note_owner_id = lookup["user_id"]
    # Find attachment
    att = att_repo.find_by_id(note_owner_id, attachment_id)
    if not att:
        return error_response("Attachment not found", 404)
    url = s3_service.generate_download_url(att.file_key)
    return success_response({"downloadUrl": url, "fileName": att.file_name})


@public_lambda_handler
def get_user_notes(event, user_id, body, path_params, query_params):
    use_case = GetUserPublicNotesUseCase(repo)
    limit = int(query_params.get("limit", "20"))
    cursor = query_params.get("cursor")
    result = use_case.execute(
        user_id=path_params.get("userId", ""),
        limit=min(limit, 50),
        cursor=cursor,
    )
    return success_response(result)
