from contexts.profile.application.get_profile import GetProfileUseCase
from contexts.profile.application.update_profile import UpdateProfileUseCase
from contexts.profile.infrastructure.dynamo_profile_repository import DynamoProfileRepository
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler, public_lambda_handler

repo = DynamoProfileRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("GET", "/users/{userId}"): get_public_profile,
        ("GET", "/me/profile"): get_own_profile,
        ("PUT", "/me/profile"): update_own_profile,
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
        display_name=body.get("displayName"),
        university=body.get("university"),
        bio=body.get("bio"),
    )
    return success_response(profile.to_api_dict())
