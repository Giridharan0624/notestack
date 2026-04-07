import os

import boto3


class S3AttachmentService:
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

    def generate_download_url(self, key: str, expiration: int = 3600) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": key},
            ExpiresIn=expiration,
        )

    def delete_object(self, key: str) -> None:
        self.client.delete_object(Bucket=self.bucket_name, Key=key)
