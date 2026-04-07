import base64
import json

from contexts.feed.domain.feed_repository import FeedRepository
from contexts.note.domain.note_entity import Note


class GetFeedUseCase:
    def __init__(self, repository: FeedRepository):
        self.repository = repository

    def execute(self, limit: int = 20, cursor: str | None = None) -> dict:
        last_key = None
        if cursor:
            last_key = json.loads(base64.b64decode(cursor))

        items, next_key = self.repository.find_public_notes(limit, last_key)
        notes = [Note.from_dynamo_item(item).to_api_dict() for item in items]

        next_cursor = None
        if next_key:
            next_cursor = base64.b64encode(json.dumps(next_key).encode()).decode()

        return {"notes": notes, "nextCursor": next_cursor}
