from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler
from contexts.sharing.application.actions import (
    ShareNoteUseCase, GetNotificationsUseCase, MarkReadUseCase, GetUnreadCountUseCase,
)
from contexts.sharing.infrastructure.dynamo_sharing_repository import DynamoSharingRepository

repo = DynamoSharingRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("POST", "/notes/{id}/share"): share_note,
        ("GET", "/me/notifications"): get_notifications,
        ("PUT", "/me/notifications/{shareId}/read"): mark_read,
        ("GET", "/me/notifications/unread-count"): get_unread_count,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def share_note(event, user_id, body, path_params, query_params):
    uc = ShareNoteUseCase(repo)
    share = uc.execute(user_id, path_params.get("id", ""), body.get("recipientId", ""))
    return success_response(share.to_api_dict(), 201)


@lambda_handler
def get_notifications(event, user_id, body, path_params, query_params):
    notifications = GetNotificationsUseCase(repo).execute(user_id)
    return success_response({"notifications": notifications})


@lambda_handler
def mark_read(event, user_id, body, path_params, query_params):
    MarkReadUseCase(repo).execute(user_id, path_params.get("shareId", ""))
    return success_response({"message": "Marked as read"})


@lambda_handler
def get_unread_count(event, user_id, body, path_params, query_params):
    count = GetUnreadCountUseCase(repo).execute(user_id)
    return success_response({"count": count})
