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
