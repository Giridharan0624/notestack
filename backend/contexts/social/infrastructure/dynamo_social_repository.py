import os

import boto3
from boto3.dynamodb.conditions import Key

from contexts.shared.infrastructure.dynamo_client import get_table
from contexts.social.domain.entities import Follow, Like, Bookmark


class DynamoSocialRepository:
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    # ── Follow ──
    def save_follow(self, follow: Follow) -> None:
        self.table.put_item(Item=follow.to_dynamo_item())

    def delete_follow(self, follower_id: str, followee_id: str) -> None:
        self.table.delete_item(Key={"pk": f"USER#{follower_id}", "sk": f"FOLLOW#{followee_id}"})

    def find_follow(self, follower_id: str, followee_id: str) -> bool:
        r = self.table.get_item(Key={"pk": f"USER#{follower_id}", "sk": f"FOLLOW#{followee_id}"})
        return "Item" in r

    def find_following(self, user_id: str) -> list[dict]:
        r = self.table.query(KeyConditionExpression=Key("pk").eq(f"USER#{user_id}") & Key("sk").begins_with("FOLLOW#"))
        return [{"userId": i["followee_id"], "createdAt": i["created_at"]} for i in r.get("Items", [])]

    def find_followers(self, user_id: str) -> list[dict]:
        r = self.table.query(IndexName="gsi1", KeyConditionExpression=Key("gsi1pk").eq(f"FOLLOWERS#{user_id}"))
        return [{"userId": i["follower_id"], "createdAt": i["created_at"]} for i in r.get("Items", [])]

    # ── Like ──
    def save_like(self, like: Like) -> None:
        self.table.put_item(Item=like.to_dynamo_item())

    def delete_like(self, user_id: str, note_id: str) -> None:
        self.table.delete_item(Key={"pk": f"USER#{user_id}", "sk": f"LIKE#{note_id}"})

    def find_like(self, user_id: str, note_id: str) -> bool:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"LIKE#{note_id}"})
        return "Item" in r

    def find_like_item(self, user_id: str, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"LIKE#{note_id}"})
        return r.get("Item")

    def increment_like_count(self, note_owner_id: str, note_id: str, delta: int) -> None:
        self.table.update_item(
            Key={"pk": f"USER#{note_owner_id}", "sk": f"NOTE#{note_id}"},
            UpdateExpression="ADD like_count :d",
            ExpressionAttributeValues={":d": delta},
        )

    # ── Bookmark ──
    def save_bookmark(self, bookmark: Bookmark) -> None:
        self.table.put_item(Item=bookmark.to_dynamo_item())

    def delete_bookmark(self, user_id: str, note_id: str) -> None:
        self.table.delete_item(Key={"pk": f"USER#{user_id}", "sk": f"BOOKMARK#{note_id}"})

    def find_bookmark(self, user_id: str, note_id: str) -> bool:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"BOOKMARK#{note_id}"})
        return "Item" in r

    def find_user_bookmarks(self, user_id: str) -> list[Bookmark]:
        r = self.table.query(KeyConditionExpression=Key("pk").eq(f"USER#{user_id}") & Key("sk").begins_with("BOOKMARK#"))
        return [Bookmark(
            user_id=i["user_id"], note_id=i["note_id"], note_owner_id=i.get("note_owner_id", ""),
            note_title=i.get("note_title", ""), note_author_name=i.get("note_author_name", ""),
            created_at=i.get("created_at", ""),
        ) for i in r.get("Items", [])]

    # ── Counters ──
    def increment_follower_count(self, user_id: str, delta: int) -> None:
        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="ADD follower_count :d",
            ExpressionAttributeValues={":d": delta},
        )

    def increment_following_count(self, user_id: str, delta: int) -> None:
        self.table.update_item(
            Key={"pk": f"USER#{user_id}", "sk": "PROFILE"},
            UpdateExpression="ADD following_count :d",
            ExpressionAttributeValues={":d": delta},
        )

    # ── Note lookup ──
    def find_note_lookup(self, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"NOTE#{note_id}", "sk": "LOOKUP"})
        return r.get("Item")

    def find_note(self, user_id: str, note_id: str) -> dict | None:
        r = self.table.get_item(Key={"pk": f"USER#{user_id}", "sk": f"NOTE#{note_id}"})
        return r.get("Item")
