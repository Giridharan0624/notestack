from contexts.note.domain.note_entity import Note


def test_create_note():
    note = Note(user_id="user-1", title="Test Note", content="Hello")
    assert note.user_id == "user-1"
    assert note.title == "Test Note"
    assert note.content == "Hello"
    assert note.note_id  # auto-generated
    assert note.created_at
    assert note.updated_at


def test_note_to_dynamo_item():
    note = Note(user_id="user-1", note_id="note-1", title="Test", content="Body")
    item = note.to_dynamo_item()
    assert item["pk"] == "USER#user-1"
    assert item["sk"] == "NOTE#note-1"
    assert item["entity_type"] == "NOTE"
    assert item["title"] == "Test"


def test_note_from_dynamo_item():
    item = {
        "pk": "USER#user-1",
        "sk": "NOTE#note-1",
        "user_id": "user-1",
        "note_id": "note-1",
        "title": "Test",
        "content": "Body",
        "created_at": "2024-01-01T00:00:00+00:00",
        "updated_at": "2024-01-01T00:00:00+00:00",
    }
    note = Note.from_dynamo_item(item)
    assert note.user_id == "user-1"
    assert note.note_id == "note-1"
    assert note.title == "Test"


def test_note_to_api_dict():
    note = Note(user_id="user-1", note_id="note-1", title="Test", content="Body")
    api = note.to_api_dict()
    assert api["noteId"] == "note-1"
    assert api["userId"] == "user-1"
    assert "createdAt" in api
