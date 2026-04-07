from boto3.dynamodb.conditions import Key, Attr

from contexts.feed.domain.feed_repository import FeedRepository
from contexts.shared.infrastructure.dynamo_client import get_table


class DynamoFeedRepository(FeedRepository):
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    def find_public_notes(self, limit: int = 20, last_key: dict | None = None) -> tuple[list[dict], dict | None]:
        kwargs = {
            "IndexName": "gsi2",
            "KeyConditionExpression": Key("gsi2pk").eq("FEED#PUBLIC"),
            "ScanIndexForward": False,
            "Limit": limit,
        }
        if last_key:
            kwargs["ExclusiveStartKey"] = last_key

        response = self.table.query(**kwargs)
        return response.get("Items", []), response.get("LastEvaluatedKey")

    def find_public_notes_by_user(self, user_id: str, limit: int = 20, last_key: dict | None = None) -> tuple[list[dict], dict | None]:
        kwargs = {
            "KeyConditionExpression": Key("pk").eq(f"USER#{user_id}") & Key("sk").begins_with("NOTE#"),
            "FilterExpression": Attr("visibility").eq("public"),
            "Limit": limit,
        }
        if last_key:
            kwargs["ExclusiveStartKey"] = last_key

        response = self.table.query(**kwargs)
        return response.get("Items", []), response.get("LastEvaluatedKey")

    def find_note_lookup(self, note_id: str) -> dict | None:
        response = self.table.get_item(
            Key={"pk": f"NOTE#{note_id}", "sk": "LOOKUP"}
        )
        return response.get("Item")

    def find_note_by_key(self, user_id: str, note_id: str) -> dict | None:
        response = self.table.get_item(
            Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"}
        )
        return response.get("Item")
