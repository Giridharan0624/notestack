from contexts.feed.application.get_feed import GetFeedUseCase
from contexts.feed.application.get_public_note import GetPublicNoteUseCase
from contexts.feed.application.get_user_notes import GetUserPublicNotesUseCase
from contexts.feed.infrastructure.dynamo_feed_repository import DynamoFeedRepository
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import public_lambda_handler

repo = DynamoFeedRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("GET", "/feed"): get_feed,
        ("GET", "/feed/notes/{noteId}"): get_public_note,
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
