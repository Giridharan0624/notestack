from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler
from contexts.groups.application.actions import (
    CreateGroupUseCase, GetGroupUseCase, ListMyGroupsUseCase,
    InviteUserUseCase, AcceptInviteUseCase, DeclineInviteUseCase, GetMyInvitesUseCase,
    RemoveMemberUseCase, ShareNoteToGroupUseCase, DeleteGroupUseCase,
)
from contexts.groups.infrastructure.dynamo_groups_repository import DynamoGroupsRepository

repo = DynamoGroupsRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("POST", "/groups"): create_group,
        ("GET", "/me/groups"): list_my_groups,
        ("GET", "/me/invites"): get_my_invites,
        ("GET", "/groups/{groupId}"): get_group,
        ("POST", "/groups/{groupId}/invite"): invite_user,
        ("POST", "/groups/{groupId}/accept"): accept_invite,
        ("POST", "/groups/{groupId}/decline"): decline_invite,
        ("DELETE", "/groups/{groupId}/members/{userId}"): remove_member,
        ("POST", "/groups/{groupId}/notes"): share_note_to_group,
        ("DELETE", "/groups/{groupId}"): delete_group,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def create_group(event, user_id, body, path_params, query_params):
    result = CreateGroupUseCase(repo).execute(user_id, body.get("name", ""))
    return success_response(result, 201)


@lambda_handler
def list_my_groups(event, user_id, body, path_params, query_params):
    groups = ListMyGroupsUseCase(repo).execute(user_id)
    return success_response({"groups": groups})


@lambda_handler
def get_my_invites(event, user_id, body, path_params, query_params):
    invites = GetMyInvitesUseCase(repo).execute(user_id)
    return success_response({"invites": invites})


@lambda_handler
def get_group(event, user_id, body, path_params, query_params):
    result = GetGroupUseCase(repo).execute(path_params.get("groupId", ""), user_id)
    return success_response(result)


@lambda_handler
def invite_user(event, user_id, body, path_params, query_params):
    InviteUserUseCase(repo).execute(path_params.get("groupId", ""), user_id, body.get("userId", ""))
    return success_response({"message": "Invite sent"})


@lambda_handler
def accept_invite(event, user_id, body, path_params, query_params):
    AcceptInviteUseCase(repo).execute(user_id, path_params.get("groupId", ""))
    return success_response({"message": "Joined group"})


@lambda_handler
def decline_invite(event, user_id, body, path_params, query_params):
    DeclineInviteUseCase(repo).execute(user_id, path_params.get("groupId", ""))
    return success_response({"message": "Invite declined"})


@lambda_handler
def remove_member(event, user_id, body, path_params, query_params):
    RemoveMemberUseCase(repo).execute(path_params.get("groupId", ""), user_id, path_params.get("userId", ""))
    return success_response({"message": "Member removed"})


@lambda_handler
def share_note_to_group(event, user_id, body, path_params, query_params):
    ShareNoteToGroupUseCase(repo).execute(path_params.get("groupId", ""), user_id, body.get("noteId", ""))
    return success_response({"message": "Note shared to group"})


@lambda_handler
def delete_group(event, user_id, body, path_params, query_params):
    DeleteGroupUseCase(repo).execute(path_params.get("groupId", ""), user_id)
    return success_response({"message": "Group deleted"})
