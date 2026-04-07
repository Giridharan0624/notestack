import pytest

from contexts.attachment.application.create_attachment import CreateAttachmentUseCase
from contexts.attachment.application.list_attachments import ListAttachmentsUseCase
from contexts.attachment.domain.attachment_entity import Attachment
from contexts.attachment.domain.attachment_repository import AttachmentRepository
from contexts.shared.domain.exceptions import ValidationError


class InMemoryAttachmentRepository(AttachmentRepository):
    def __init__(self):
        self.attachments: dict[str, Attachment] = {}

    def save(self, attachment: Attachment) -> None:
        self.attachments[f"{attachment.user_id}:{attachment.attachment_id}"] = attachment

    def find_by_note(self, note_id: str) -> list[Attachment]:
        return [a for a in self.attachments.values() if a.note_id == note_id]

    def find_by_id(self, user_id: str, attachment_id: str) -> Attachment | None:
        return self.attachments.get(f"{user_id}:{attachment_id}")

    def delete(self, user_id: str, attachment_id: str) -> None:
        self.attachments.pop(f"{user_id}:{attachment_id}", None)


@pytest.fixture
def repo():
    return InMemoryAttachmentRepository()


def test_create_attachment(repo):
    uc = CreateAttachmentUseCase(repo)
    att = uc.execute(
        user_id="user-1",
        note_id="note-1",
        file_name="doc.pdf",
        file_key="users/user-1/notes/note-1/abc_doc.pdf",
        file_size=1024,
        content_type="application/pdf",
    )
    assert att.file_name == "doc.pdf"
    assert att.note_id == "note-1"
    assert len(repo.attachments) == 1


def test_create_attachment_missing_fields(repo):
    uc = CreateAttachmentUseCase(repo)
    with pytest.raises(ValidationError):
        uc.execute(user_id="user-1", note_id="note-1", file_name="", file_key="")


def test_list_attachments(repo):
    create = CreateAttachmentUseCase(repo)
    create.execute("user-1", "note-1", "a.pdf", "key-a", 100, "application/pdf")
    create.execute("user-1", "note-1", "b.pdf", "key-b", 200, "application/pdf")
    create.execute("user-1", "note-2", "c.pdf", "key-c", 300, "application/pdf")

    uc = ListAttachmentsUseCase(repo)
    attachments = uc.execute("note-1")
    assert len(attachments) == 2
