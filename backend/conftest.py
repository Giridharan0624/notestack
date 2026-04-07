import os

import pytest

# Ensure AWS SDK doesn't hit real AWS during tests
os.environ.setdefault("AWS_DEFAULT_REGION", "us-east-1")
os.environ.setdefault("AWS_ACCESS_KEY_ID", "testing")
os.environ.setdefault("AWS_SECRET_ACCESS_KEY", "testing")
os.environ.setdefault("AWS_SECURITY_TOKEN", "testing")
os.environ.setdefault("AWS_SESSION_TOKEN", "testing")
os.environ.setdefault("TABLE_NAME", "NoteStackTable")
os.environ.setdefault("BUCKET_NAME", "notestack-uploads")
