from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler
from contexts.user.application.get_profile import GetProfileUseCase
from contexts.user.application.delete_account import DeleteAccountUseCase
from contexts.user.infrastructure.cognito_user_service import CognitoUserService

cognito_service = CognitoUserService()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("GET", "/me"): get_profile,
        ("DELETE", "/me"): delete_account,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def get_profile(event, user_id, body, path_params, query_params):
    use_case = GetProfileUseCase(cognito_service)
    user = use_case.execute(user_id)
    return success_response(user.to_api_dict())


@lambda_handler
def delete_account(event, user_id, body, path_params, query_params):
    use_case = DeleteAccountUseCase(cognito_service)
    use_case.execute(user_id)
    return success_response({"message": "Account deleted"})
