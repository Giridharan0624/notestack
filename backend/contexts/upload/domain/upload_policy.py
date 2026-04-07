ALLOWED_CONTENT_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/webp",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
PRESIGNED_URL_EXPIRATION = 300  # 5 minutes


def validate_upload(file_name: str, content_type: str, file_size: int | None = None) -> None:
    if not file_name or not file_name.strip():
        raise ValueError("File name is required")

    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Content type '{content_type}' is not allowed")

    if file_size is not None and file_size > MAX_FILE_SIZE:
        raise ValueError(f"File size exceeds maximum of {MAX_FILE_SIZE // (1024 * 1024)} MB")
