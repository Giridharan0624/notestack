from contexts.shared.domain.exceptions import ValidationError, NotFoundError
from contexts.social.domain.entities import Follow, Like, Bookmark
from contexts.social.infrastructure.dynamo_social_repository import DynamoSocialRepository


class FollowUserUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, follower_id: str, followee_id: str) -> None:
        if follower_id == followee_id:
            raise ValidationError("Cannot follow yourself")
        if self.repo.find_follow(follower_id, followee_id):
            raise ValidationError("Already following")
        self.repo.save_follow(Follow(follower_id=follower_id, followee_id=followee_id))
        self.repo.increment_follower_count(followee_id, 1)
        self.repo.increment_following_count(follower_id, 1)


class UnfollowUserUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, follower_id: str, followee_id: str) -> None:
        if not self.repo.find_follow(follower_id, followee_id):
            raise NotFoundError("Not following this user")
        self.repo.delete_follow(follower_id, followee_id)
        self.repo.increment_follower_count(followee_id, -1)
        self.repo.increment_following_count(follower_id, -1)


class LikeNoteUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str, note_id: str) -> None:
        lookup = self.repo.find_note_lookup(note_id)
        if not lookup:
            raise NotFoundError("Note not found")
        if self.repo.find_like(user_id, note_id):
            raise ValidationError("Already liked")
        note_owner_id = lookup["user_id"]
        self.repo.save_like(Like(user_id=user_id, note_id=note_id, note_owner_id=note_owner_id))
        self.repo.increment_like_count(note_owner_id, note_id, 1)


class UnlikeNoteUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str, note_id: str) -> None:
        like_item = self.repo.find_like_item(user_id, note_id)
        if not like_item:
            raise NotFoundError("Not liked")
        note_owner_id = like_item["note_owner_id"]
        self.repo.delete_like(user_id, note_id)
        self.repo.increment_like_count(note_owner_id, note_id, -1)


class BookmarkNoteUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str, note_id: str) -> None:
        lookup = self.repo.find_note_lookup(note_id)
        if not lookup:
            raise NotFoundError("Note not found")
        if self.repo.find_bookmark(user_id, note_id):
            raise ValidationError("Already bookmarked")
        note_owner_id = lookup["user_id"]
        note = self.repo.find_note(note_owner_id, note_id)
        self.repo.save_bookmark(Bookmark(
            user_id=user_id,
            note_id=note_id,
            note_owner_id=note_owner_id,
            note_title=note.get("title", "") if note else "",
            note_author_name=note.get("author_display_name", "") if note else "",
        ))


class UnbookmarkNoteUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str, note_id: str) -> None:
        if not self.repo.find_bookmark(user_id, note_id):
            raise NotFoundError("Not bookmarked")
        self.repo.delete_bookmark(user_id, note_id)


class GetBookmarksUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str) -> list[dict]:
        bookmarks = self.repo.find_user_bookmarks(user_id)
        return [b.to_api_dict() for b in bookmarks]


class GetSocialStatusUseCase:
    def __init__(self, repo: DynamoSocialRepository):
        self.repo = repo

    def execute(self, user_id: str, note_ids: list[str], user_ids: list[str]) -> dict:
        likes = {nid: self.repo.find_like(user_id, nid) for nid in note_ids}
        bookmarks = {nid: self.repo.find_bookmark(user_id, nid) for nid in note_ids}
        follows = {uid: self.repo.find_follow(user_id, uid) for uid in user_ids}
        return {"likes": likes, "bookmarks": bookmarks, "follows": follows}
