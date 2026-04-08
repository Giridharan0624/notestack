from contexts.profile.application.get_profile import GetProfileUseCase
from contexts.profile.application.update_profile import UpdateProfileUseCase
from contexts.profile.application.upload_avatar import GenerateAvatarUploadUrlUseCase, SetAvatarUseCase
from contexts.profile.infrastructure.dynamo_profile_repository import DynamoProfileRepository
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler, public_lambda_handler

repo = DynamoProfileRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("GET", "/users/search"): search_users,
        ("GET", "/users/{userId}"): get_public_profile,
        ("GET", "/users/{userId}/stats"): get_user_stats,
        ("GET", "/u/{username}"): get_profile_by_username,
        ("GET", "/me/profile"): get_own_profile,
        ("PUT", "/me/profile"): update_own_profile,
        ("POST", "/me/avatar-upload-url"): get_avatar_upload_url,
        ("PUT", "/me/avatar"): set_avatar,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@public_lambda_handler
def get_public_profile(event, user_id, body, path_params, query_params):
    use_case = GetProfileUseCase(repo)
    target_user_id = path_params.get("userId", "")
    profile = use_case.execute(target_user_id)
    return success_response(profile.to_api_dict())


@public_lambda_handler
def get_user_stats(event, user_id, body, path_params, query_params):
    from contexts.profile.application.get_profile_stats import GetProfileStatsUseCase
    use_case = GetProfileStatsUseCase()
    target_user_id = path_params.get("userId", "")
    stats = use_case.execute(target_user_id)
    return success_response(stats)


@lambda_handler
def get_own_profile(event, user_id, body, path_params, query_params):
    use_case = GetProfileUseCase(repo)
    profile = use_case.execute(user_id)
    return success_response(profile.to_api_dict())


@lambda_handler
def update_own_profile(event, user_id, body, path_params, query_params):
    use_case = UpdateProfileUseCase(repo)
    profile = use_case.execute(
        user_id=user_id,
        username=body.get("username"),
        display_name=body.get("displayName"),
        university=body.get("university"),
        bio=body.get("bio"),
        year_of_study=body.get("yearOfStudy"),
        major=body.get("major"),
        social_links=body.get("socialLinks"),
    )
    return success_response(profile.to_api_dict())


@lambda_handler
def get_avatar_upload_url(event, user_id, body, path_params, query_params):
    use_case = GenerateAvatarUploadUrlUseCase()
    result = use_case.execute(
        user_id=user_id,
        file_name=body.get("fileName", ""),
        content_type=body.get("contentType", ""),
    )
    return success_response(result)


@lambda_handler
def set_avatar(event, user_id, body, path_params, query_params):
    use_case = SetAvatarUseCase(repo)
    result = use_case.execute(user_id=user_id, avatar_url=body.get("avatarUrl", ""))
    return success_response(result)


@lambda_handler
def search_users(event, user_id, body, path_params, query_params):
    q = query_params.get("q", "").strip()
    if not q or len(q) < 2:
        return success_response({"users": []})
    profiles = repo.search(q)
    return success_response({"users": [
        {"userId": p.user_id, "displayName": p.display_name, "avatarUrl": p.avatar_url, "username": p.username}
        for p in profiles
    ]})


@public_lambda_handler
def get_profile_by_username(event, user_id, body, path_params, query_params):
    username = path_params.get("username", "")
    profile = repo.find_by_username(username)
    if not profile:
        return error_response("User not found", 404)
    return success_response(profile.to_api_dict())
