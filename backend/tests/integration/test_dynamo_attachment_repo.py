import boto3
import pytest
from moto import mock_aws

from contexts.attachment.domain.attachment_entity import Attachment
from contexts.attachment.infrastructure.dynamo_attachment_repository import DynamoAttachmentRepository


@pytest.fixture
def dynamo_table():
    with mock_aws():
        dynamodb = boto3.resource("dynamodb", region_name="us-east-1")
        table = dynamodb.create_table(
            TableName="NoteStackTable",
            KeySchema=[
                {"AttributeName": "pk", "KeyType": "HASH"},
                {"AttributeName": "sk", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "pk", "AttributeType": "S"},
                {"AttributeName": "sk", "AttributeType": "S"},
                {"AttributeName": "gsi1pk", "AttributeType": "S"},
                {"AttributeName": "gsi1sk", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "gsi1",
                    "KeySchema": [
                        {"AttributeName": "gsi1pk", "KeyType": "HASH"},
                        {"AttributeName": "gsi1sk", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table


@pytest.fixture
def repo(dynamo_table):
    return DynamoAttachmentRepository(table=dynamo_table)


def test_save_and_find_by_id(repo):
    att = Attachment(
        user_id="user-1",
        attachment_id="att-1",
        note_id="note-1",
        file_name="doc.pdf",
        file_key="users/user-1/notes/note-1/doc.pdf",
        file_size=1024,
        content_type="application/pdf",
    )
    repo.save(att)

    found = repo.find_by_id("user-1", "att-1")
    assert found is not None
    assert found.file_name == "doc.pdf"


def test_find_by_note(repo):
    for i in range(3):
        repo.save(
            Attachment(
                user_id="user-1",
                attachment_id=f"att-{i}",
                note_id="note-1",
                file_name=f"file-{i}.pdf",
                file_key=f"key-{i}",
            )
        )
    repo.save(
        Attachment(
            user_id="user-1",
            attachment_id="att-other",
            note_id="note-2",
            file_name="other.pdf",
            file_key="key-other",
        )
    )

    attachments = repo.find_by_note("note-1")
    assert len(attachments) == 3


def test_delete(repo):
    repo.save(
        Attachment(
            user_id="user-1",
            attachment_id="att-1",
            note_id="note-1",
            file_name="doc.pdf",
            file_key="key-1",
        )
    )
    repo.delete("user-1", "att-1")
    assert repo.find_by_id("user-1", "att-1") is None
