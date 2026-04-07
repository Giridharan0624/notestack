import os

import boto3

from contexts.profile.domain.profile_repository import ProfileRepository
from contexts.shared.domain.exceptions import ValidationError
from contexts.shared.domain.value_objects import generate_id, now_iso

ALLOWED_TYPES = ("image/png", "image/jpeg", "image/webp")
MAX_SIZE = 2 * 1024 * 1024  # 2MB


class GenerateAvatarUploadUrlUseCase:
    def __init__(self, s3_client=None, bucket_name: str | None = None):
        self._client = s3_client or boto3.client("s3")
        self._bucket = bucket_name or os.environ.get("BUCKET_NAME", "")

    def execute(self, user_id: str, file_name: str, content_type: str) -> dict:
        if content_type not in ALLOWED_TYPES:
            raise ValidationError("Avatar must be PNG, JPEG, or WebP")
        if not file_name:
            raise ValidationError("File name is required")

        key = f"avatars/{user_id}/{generate_id()}_{file_name}"
        url = self._client.generate_presigned_url(
            "put_object",
            Params={"Bucket": self._bucket, "Key": key, "ContentType": content_type},
            ExpiresIn=300,
        )
        return {"uploadUrl": url, "avatarKey": key}


class SetAvatarUseCase:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository

    def execute(self, user_id: str, avatar_url: str) -> dict:
        if not avatar_url.startswith("avatars/"):
            raise ValidationError("Invalid avatar key")

        profile = self.repository.find_by_user_id(user_id)
        if not profile:
            from contexts.profile.domain.profile_entity import Profile
            profile = Profile(user_id=user_id)

        profile.avatar_url = avatar_url
        profile.updated_at = now_iso()
        self.repository.save(profile)
        return {"avatarUrl": avatar_url}
