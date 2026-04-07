import os

import boto3

from contexts.upload.domain.upload_policy import PRESIGNED_URL_EXPIRATION


class S3UploadService:
    def __init__(self, s3_client=None, bucket_name: str | None = None):
        self._client = s3_client
        self._bucket_name = bucket_name

    @property
    def client(self):
        if self._client is None:
            self._client = boto3.client("s3")
        return self._client

    @property
    def bucket_name(self):
        if self._bucket_name is None:
            self._bucket_name = os.environ.get("BUCKET_NAME", "notestack-uploads")
        return self._bucket_name

    def generate_presigned_url(self, key: str, content_type: str) -> str:
        return self.client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": self.bucket_name,
                "Key": key,
                "ContentType": content_type,
            },
            ExpiresIn=PRESIGNED_URL_EXPIRATION,
        )
