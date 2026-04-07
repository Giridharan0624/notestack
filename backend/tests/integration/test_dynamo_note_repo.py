import boto3
import pytest
from moto import mock_aws

from contexts.note.domain.note_entity import Note
from contexts.note.infrastructure.dynamo_note_repository import DynamoNoteRepository


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
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        yield table


@pytest.fixture
def repo(dynamo_table):
    return DynamoNoteRepository(table=dynamo_table)


def test_save_and_find_by_id(repo):
    note = Note(user_id="user-1", note_id="note-1", title="Test", content="Body")
    repo.save(note)

    found = repo.find_by_id("user-1", "note-1")
    assert found is not None
    assert found.title == "Test"
    assert found.note_id == "note-1"


def test_find_by_id_not_found(repo):
    found = repo.find_by_id("user-1", "nonexistent")
    assert found is None


def test_find_all_by_user(repo):
    repo.save(Note(user_id="user-1", note_id="n1", title="Note 1"))
    repo.save(Note(user_id="user-1", note_id="n2", title="Note 2"))
    repo.save(Note(user_id="user-2", note_id="n3", title="Other"))

    notes = repo.find_all_by_user("user-1")
    assert len(notes) == 2
    titles = {n.title for n in notes}
    assert titles == {"Note 1", "Note 2"}


def test_delete(repo):
    repo.save(Note(user_id="user-1", note_id="n1", title="To Delete"))
    repo.delete("user-1", "n1")

    found = repo.find_by_id("user-1", "n1")
    assert found is None
