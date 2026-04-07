import pytest

from contexts.upload.domain.upload_policy import validate_upload


def test_valid_upload():
    validate_upload("doc.pdf", "application/pdf", 1024)


def test_invalid_content_type():
    with pytest.raises(ValueError, match="not allowed"):
        validate_upload("file.exe", "application/x-msdownload", 1024)


def test_empty_file_name():
    with pytest.raises(ValueError, match="File name is required"):
        validate_upload("", "application/pdf")


def test_file_too_large():
    with pytest.raises(ValueError, match="exceeds maximum"):
        validate_upload("big.pdf", "application/pdf", 20 * 1024 * 1024)
