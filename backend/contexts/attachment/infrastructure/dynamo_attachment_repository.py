from boto3.dynamodb.conditions import Key

from contexts.attachment.domain.attachment_entity import Attachment
from contexts.attachment.domain.attachment_repository import AttachmentRepository
from contexts.shared.infrastructure.dynamo_client import get_table


class DynamoAttachmentRepository(AttachmentRepository):
    def __init__(self, table=None):
        self._table = table

    @property
    def table(self):
        if self._table is None:
            self._table = get_table()
        return self._table

    def save(self, attachment: Attachment) -> None:
        self.table.put_item(Item=attachment.to_dynamo_item())

    def find_by_note(self, note_id: str) -> list[Attachment]:
        response = self.table.query(
            IndexName="gsi1",
            KeyConditionExpression=Key("gsi1pk").eq(f"NOTE#{note_id}")
            & Key("gsi1sk").begins_with("ATTACH#"),
        )
        return [Attachment.from_dynamo_item(item) for item in response.get("Items", [])]

    def find_by_id(self, user_id: str, attachment_id: str) -> Attachment | None:
        response = self.table.get_item(
            Key={"pk": f"USER#{user_id}", "sk": f"ATTACH#{attachment_id}"}
        )
        item = response.get("Item")
        if not item:
            return None
        return Attachment.from_dynamo_item(item)

    def delete(self, user_id: str, attachment_id: str) -> None:
        self.table.delete_item(
            Key={"pk": f"USER#{user_id}", "sk": f"ATTACH#{attachment_id}"}
        )
