from boto3.dynamodb.conditions import Key, Attr

from contexts.shared.infrastructure.dynamo_client import get_table
from contexts.sharing.domain.entities import Share


class DynamoSharingRepository:
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    def save_share(self, share: Share) -> None:
        self.table.put_item(Item=share.to_dynamo_item())

    def find_notifications(self, recipient_id: str, limit: int = 30) -> list[dict]:
        r = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{recipient_id}") & Key("sk").begins_with("SHARE#"),
            ScanIndexForward=False,
            Limit=limit,
        )
        return r.get("Items", [])

    def mark_read(self, recipient_id: str, sk: str) -> None:
        self.table.update_item(
            Key={"pk": f"USER#{recipient_id}", "sk": sk},
            UpdateExpression="SET #r = :t",
            ExpressionAttributeNames={"#r": "read"},
            ExpressionAttributeValues={":t": True},
        )

    def count_unread(self, recipient_id: str) -> int:
        r = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{recipient_id}") & Key("sk").begins_with("SHARE#"),
            FilterExpression=Attr("read").eq(False),
            Select="COUNT",
        )
        return r.get("Count", 0)

    def find_note_lookup(self, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"NOTE#{note_id}", "sk": "LOOKUP"})
        return r.get("Item")

    def find_note(self, user_id: str, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"})
        return r.get("Item")

    def find_profile(self, user_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "PROFILE"})
        return r.get("Item")
