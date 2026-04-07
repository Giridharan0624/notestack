import os

import boto3

from contexts.user.domain.user_entity import User


class CognitoUserService:
    def __init__(self, client=None, user_pool_id: str | None = None):
        self._client = client
        self._user_pool_id = user_pool_id

    @property
    def client(self):
        if self._client is None:
            self._client = boto3.client("cognito-idp")
        return self._client

    @property
    def user_pool_id(self):
        if self._user_pool_id is None:
            self._user_pool_id = os.environ.get("USER_POOL_ID", "")
        return self._user_pool_id

    def get_user(self, user_id: str) -> User | None:
        try:
            response = self.client.admin_get_user(
                UserPoolId=self.user_pool_id,
                Username=user_id,
            )
            attrs = {a["Name"]: a["Value"] for a in response.get("UserAttributes", [])}
            return User(
                user_id=attrs.get("sub", user_id),
                email=attrs.get("email", ""),
                email_verified=attrs.get("email_verified", "false") == "true",
            )
        except self.client.exceptions.UserNotFoundException:
            return None

    def delete_user(self, user_id: str) -> None:
        self.client.admin_delete_user(
            UserPoolId=self.user_pool_id,
            Username=user_id,
        )
