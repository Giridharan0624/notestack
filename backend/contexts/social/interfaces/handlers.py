from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler, public_lambda_handler
from contexts.social.application.actions import (
    FollowUserUseCase, UnfollowUserUseCase,
    LikeNoteUseCase, UnlikeNoteUseCase,
    BookmarkNoteUseCase, UnbookmarkNoteUseCase,
    GetBookmarksUseCase, GetSocialStatusUseCase,
)
from contexts.social.infrastructure.dynamo_social_repository import DynamoSocialRepository

repo = DynamoSocialRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("POST", "/users/{userId}/follow"): follow_user,
        ("DELETE", "/users/{userId}/follow"): unfollow_user,
        ("GET", "/users/{userId}/followers"): get_followers,
        ("GET", "/users/{userId}/following"): get_following,
        ("POST", "/notes/{id}/like"): like_note,
        ("DELETE", "/notes/{id}/like"): unlike_note,
        ("POST", "/notes/{id}/bookmark"): bookmark_note,
        ("DELETE", "/notes/{id}/bookmark"): unbookmark_note,
        ("GET", "/me/bookmarks"): get_bookmarks,
        ("GET", "/me/social-status"): get_social_status,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def follow_user(event, user_id, body, path_params, query_params):
    FollowUserUseCase(repo).execute(user_id, path_params.get("userId", ""))
    return success_response({"message": "Followed"})


@lambda_handler
def unfollow_user(event, user_id, body, path_params, query_params):
    UnfollowUserUseCase(repo).execute(user_id, path_params.get("userId", ""))
    return success_response({"message": "Unfollowed"})


@public_lambda_handler
def get_followers(event, user_id, body, path_params, query_params):
    users = repo.find_followers(path_params.get("userId", ""))
    return success_response({"users": users})


@public_lambda_handler
def get_following(event, user_id, body, path_params, query_params):
    users = repo.find_following(path_params.get("userId", ""))
    return success_response({"users": users})


@lambda_handler
def like_note(event, user_id, body, path_params, query_params):
    LikeNoteUseCase(repo).execute(user_id, path_params.get("id", ""))
    return success_response({"message": "Liked"})


@lambda_handler
def unlike_note(event, user_id, body, path_params, query_params):
    UnlikeNoteUseCase(repo).execute(user_id, path_params.get("id", ""))
    return success_response({"message": "Unliked"})


@lambda_handler
def bookmark_note(event, user_id, body, path_params, query_params):
    BookmarkNoteUseCase(repo).execute(user_id, path_params.get("id", ""))
    return success_response({"message": "Bookmarked"})


@lambda_handler
def unbookmark_note(event, user_id, body, path_params, query_params):
    UnbookmarkNoteUseCase(repo).execute(user_id, path_params.get("id", ""))
    return success_response({"message": "Unbookmarked"})


@lambda_handler
def get_bookmarks(event, user_id, body, path_params, query_params):
    bookmarks = GetBookmarksUseCase(repo).execute(user_id)
    return success_response({"bookmarks": bookmarks})


@lambda_handler
def get_social_status(event, user_id, body, path_params, query_params):
    note_ids = [n for n in (query_params.get("noteIds", "") or "").split(",") if n]
    user_ids = [u for u in (query_params.get("userIds", "") or "").split(",") if u]
    status = GetSocialStatusUseCase(repo).execute(user_id, note_ids, user_ids)
    return success_response(status)
