from boto3.dynamodb.conditions import Key, Attr

from contexts.note.domain.note_entity import Note
from contexts.note.domain.note_repository import NoteRepository
from contexts.shared.infrastructure.dynamo_client import get_table


class DynamoNoteRepository(NoteRepository):
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    def save(self, note: Note) -> None:
        self.table.put_item(Item=note.to_dynamo_item())
        if note.visibility == "public":
            self.save_lookup(note)
        else:
            self.delete_lookup(note.note_id)

    def find_by_id(self, user_id: str, note_id: str) -> Note | None:
        response = self.table.get_item(
            Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"}
        )
        item = response.get("Item")
        if not item:
            return None
        return Note.from_dynamo_item(item)

    def find_all_by_user(self, user_id: str) -> list[Note]:
        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").begins_with("NOTE#")
        )
        return [Note.from_dynamo_item(item) for item in response.get("Items", [])]

    def find_public_by_user(self, user_id: str) -> list[Note]:
        response = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}")
            & Key("sk").begins_with("NOTE#"),
            FilterExpression=Attr("visibility").eq("public"),
        )
        return [Note.from_dynamo_item(item) for item in response.get("Items", [])]

    def delete(self, user_id: str, note_id: str) -> None:
        self.table.delete_item(
            Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"}
        )
        self.delete_lookup(note_id)

    def save_lookup(self, note: Note) -> None:
        self.table.put_item(Item=note.to_lookup_item())

    def delete_lookup(self, note_id: str) -> None:
        self.table.delete_item(
            Key={"pk": f"NOTE#{note_id}", "sk": "LOOKUP"}
        )
