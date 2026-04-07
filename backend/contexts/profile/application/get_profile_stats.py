from collections import Counter

from boto3.dynamodb.conditions import Key

from contexts.shared.infrastructure.dynamo_client import get_table


class GetProfileStatsUseCase:
    def __init__(self, table=None):
        self._table = table or get_table()

    def execute(self, user_id: str) -> dict:
        response = self._table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}") & Key("sk").begins_with("NOTE#"),
            ProjectionExpression="visibility, tags, like_count",
        )
        items = response.get("Items", [])

        total_notes = len(items)
        public_notes = sum(1 for i in items if i.get("visibility") == "public")
        total_likes = sum(int(i.get("like_count", 0)) for i in items)

        tag_counter: Counter[str] = Counter()
        for item in items:
            for tag in item.get("tags", []):
                tag_counter[tag] += 1

        popular_tags = [tag for tag, _ in tag_counter.most_common(5)]

        return {
            "totalNotes": total_notes,
            "publicNotes": public_notes,
            "totalLikes": total_likes,
            "popularTags": popular_tags,
        }
