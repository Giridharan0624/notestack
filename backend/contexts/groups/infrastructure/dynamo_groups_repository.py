from boto3.dynamodb.conditions import Key

from contexts.shared.infrastructure.dynamo_client import get_table
from contexts.groups.domain.entities import Group, GroupMember, GroupNote


class DynamoGroupsRepository:
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    # ── Group ──
    def save_group(self, group: Group) -> None:
        self.table.put_item(Item=group.to_dynamo_item())

    def find_group(self, group_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"GROUP#{group_id}", "sk": "META"})
        return r.get("Item")

    def delete_group(self, group_id: str) -> None:
        # Delete all items under this group
        r = self.table.query(KeyConditionExpression=Key("pk").eq(f"GROUP#{group_id}"))
        with self.table.batch_writer() as batch:
            for item in r.get("Items", []):
                batch.delete_item(Key={"pk": item["pk"], "sk": item["sk"]})

    # ── Members ──
    def save_member(self, member: GroupMember) -> None:
        self.table.put_item(Item=member.to_dynamo_item())

    def find_member(self, group_id: str, user_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"GROUP#{group_id}", "sk": f"MEMBER#{user_id}"})
        return r.get("Item")

    def delete_member(self, group_id: str, user_id: str) -> None:
        self.table.delete_item(Key={"pk": f"GROUP#{group_id}", "sk": f"MEMBER#{user_id}"})

    def find_members(self, group_id: str) -> list[dict]:
        r = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"GROUP#{group_id}") & Key("sk").begins_with("MEMBER#")
        )
        return r.get("Items", [])

    def increment_member_count(self, group_id: str, delta: int) -> None:
        self.table.update_item(
            Key={"pk": f"GROUP#{group_id}", "sk": "META"},
            UpdateExpression="ADD member_count :d",
            ExpressionAttributeValues={":d": delta},
        )

    # ── Group Notes ──
    def save_group_note(self, group_note: GroupNote) -> None:
        self.table.put_item(Item=group_note.to_dynamo_item())

    def find_group_notes(self, group_id: str, limit: int = 50) -> list[dict]:
        r = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"GROUP#{group_id}") & Key("sk").begins_with("NOTE#"),
            ScanIndexForward=False,
            Limit=limit,
        )
        return r.get("Items", [])

    # ── My Groups ──
    def find_user_groups(self, user_id: str) -> list[dict]:
        r = self.table.query(
            IndexName="gsi1",
            KeyConditionExpression=Key("gsi1pk").eq(f"USERGROUPS#{user_id}"),
            ScanIndexForward=False,
        )
        # Get group details for each
        groups = []
        for item in r.get("Items", []):
            group = self.find_group(item["group_id"])
            if group:
                groups.append(group)
        return groups

    # ── Invites ──
    def save_invite(self, invite: dict) -> None:
        self.table.put_item(Item=invite)

    def find_invite(self, user_id: str, group_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"INVITE#{group_id}"})
        return r.get("Item")

    def delete_invite(self, user_id: str, group_id: str) -> None:
        self.table.delete_item(Key={"pk": f"USER#{user_id}", "sk": f"INVITE#{group_id}"})

    def find_user_invites(self, user_id: str) -> list[dict]:
        r = self.table.query(
            KeyConditionExpression=Key("pk").eq(f"USER#{user_id}") & Key("sk").begins_with("INVITE#"),
        )
        return r.get("Items", [])

    # ── Helpers ──
    def find_profile(self, user_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": "PROFILE"})
        return r.get("Item")

    def find_note_lookup(self, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"NOTE#{note_id}", "sk": "LOOKUP"})
        return r.get("Item")

    def find_note(self, user_id: str, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"})
        return r.get("Item")
