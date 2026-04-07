from contexts.shared.domain.exceptions import NotFoundError
from contexts.user.infrastructure.cognito_user_service import CognitoUserService


class DeleteAccountUseCase:
    def __init__(self, cognito_service: CognitoUserService):
        self.cognito_service = cognito_service

    def execute(self, user_id: str) -> None:
        user = self.cognito_service.get_user(user_id)
        if not user:
            raise NotFoundError("User not found")
        self.cognito_service.delete_user(user_id)
