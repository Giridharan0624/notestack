from contexts.profile.domain.profile_entity import Profile
from contexts.profile.domain.profile_repository import ProfileRepository
from contexts.shared.infrastructure.dynamo_client import get_table


class DynamoProfileRepository(ProfileRepository):
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    def save(self, profile: Profile) -> None:
        self.table.put_item(Item=profile.to_dynamo_item())

    def find_by_user_id(self, user_id: str) -> Profile | None:
        response = self.table.get_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"}
        )
        item = response.get("Item")
        if not item:
            return None
        return Profile.from_dynamo_item(item)

    def claim_username(self, username: str, user_id: str) -> bool:
        try:
            self.table.put_item(
                Item={"pk": f"USERNAME#{username.lower()}", "sk": "CLAIM", "user_id": user_id, "entity_type": "USERNAME_CLAIM"},
                ConditionExpression="attribute_not_exists(pk)",
            )
            return True
        except Exception:
            return False

    def release_username(self, username: str) -> None:
        self.table.delete_item(Key={"pk": f"USERNAME#{username.lower()}", "sk": "CLAIM"})

    def find_by_username(self, username: str) -> Profile | None:
        r = self.table.get_item(Key={"pk": f"USERNAME#{username.lower()}", "sk": "CLAIM"})
        item = r.get("Item")
        if not item:
            return None
        return self.find_by_user_id(item["user_id"])

    def search_by_name(self, query: str, limit: int = 10) -> list[Profile]:
        from boto3.dynamodb.conditions import Attr
        response = self.table.scan(
            FilterExpression=Attr("entity_type").eq("PROFILE") & Attr("display_name").contains(query),
            Limit=limit * 5,  # Over-fetch since scan reads before filtering
        )
        profiles = [Profile.from_dynamo_item(i) for i in response.get("Items", [])]
        return profiles[:limit]
