from contexts.shared.domain.exceptions import ValidationError, NotFoundError, AuthorizationError
from contexts.groups.domain.entities import Group, GroupMember, GroupNote
from contexts.groups.infrastructure.dynamo_groups_repository import DynamoGroupsRepository


class CreateGroupUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, creator_id: str, name: str) -> dict:
        if not name or not name.strip():
            raise ValidationError("Group name is required")
        if len(name) > 50:
            raise ValidationError("Group name must be 50 characters or less")

        profile = self.repo.find_profile(creator_id)
        display_name = profile.get("display_name", "Student") if profile else "Student"

        group = Group(name=name.strip(), creator_id=creator_id)
        self.repo.save_group(group)

        member = GroupMember(group_id=group.group_id, user_id=creator_id, display_name=display_name, role="admin")
        self.repo.save_member(member)

        return group.to_api_dict()


class GetGroupUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, group_id: str, user_id: str) -> dict:
        member = self.repo.find_member(group_id, user_id)
        if not member:
            raise AuthorizationError("Not a member of this group")

        group_data = self.repo.find_group(group_id)
        if not group_data:
            raise NotFoundError("Group not found")

        members = self.repo.find_members(group_id)
        notes = self.repo.find_group_notes(group_id)

        return {
            "group": {
                "groupId": group_data["group_id"], "name": group_data["name"],
                "creatorId": group_data["creator_id"], "memberCount": int(group_data.get("member_count", 0)),
                "createdAt": group_data["created_at"],
            },
            "members": [{"userId": m["user_id"], "displayName": m.get("display_name", ""), "role": m["role"], "joinedAt": m["joined_at"]} for m in members],
            "notes": [{"noteId": n["note_id"], "noteTitle": n.get("note_title", ""), "noteOwnerId": n.get("note_owner_id", ""),
                       "sharedBy": n.get("shared_by", ""), "sharedByName": n.get("shared_by_name", ""), "sharedAt": n.get("shared_at", "")} for n in notes],
        }


class ListMyGroupsUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, user_id: str) -> list[dict]:
        groups = self.repo.find_user_groups(user_id)
        return [{"groupId": g["group_id"], "name": g["name"], "creatorId": g["creator_id"],
                 "memberCount": int(g.get("member_count", 0)), "createdAt": g["created_at"]} for g in groups]


class InviteUserUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, group_id: str, caller_id: str, target_user_id: str) -> None:
        caller = self.repo.find_member(group_id, caller_id)
        if not caller or caller.get("role") != "admin":
            raise AuthorizationError("Only admins can invite members")

        if self.repo.find_member(group_id, target_user_id):
            raise ValidationError("User is already a member")

        if self.repo.find_invite(target_user_id, group_id):
            raise ValidationError("Invite already sent")

        group = self.repo.find_group(group_id)
        caller_profile = self.repo.find_profile(caller_id)

        from contexts.shared.domain.value_objects import now_iso
        invite = {
            "pk": f"USER#{target_user_id}",
            "sk": f"INVITE#{group_id}",
            "user_id": target_user_id,
            "group_id": group_id,
            "group_name": group.get("name", "") if group else "",
            "invited_by": caller_id,
            "invited_by_name": caller_profile.get("display_name", "Student") if caller_profile else "Student",
            "created_at": now_iso(),
            "entity_type": "GROUP_INVITE",
        }
        self.repo.save_invite(invite)


class AcceptInviteUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, user_id: str, group_id: str) -> None:
        invite = self.repo.find_invite(user_id, group_id)
        if not invite:
            raise NotFoundError("Invite not found")

        if self.repo.find_member(group_id, user_id):
            self.repo.delete_invite(user_id, group_id)
            raise ValidationError("Already a member")

        profile = self.repo.find_profile(user_id)
        display_name = profile.get("display_name", "Student") if profile else "Student"

        member = GroupMember(group_id=group_id, user_id=user_id, display_name=display_name)
        self.repo.save_member(member)
        self.repo.increment_member_count(group_id, 1)
        self.repo.delete_invite(user_id, group_id)


class DeclineInviteUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, user_id: str, group_id: str) -> None:
        invite = self.repo.find_invite(user_id, group_id)
        if not invite:
            raise NotFoundError("Invite not found")
        self.repo.delete_invite(user_id, group_id)


class GetMyInvitesUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, user_id: str) -> list[dict]:
        invites = self.repo.find_user_invites(user_id)
        return [{
            "groupId": i["group_id"],
            "groupName": i.get("group_name", ""),
            "invitedBy": i.get("invited_by", ""),
            "invitedByName": i.get("invited_by_name", ""),
            "createdAt": i.get("created_at", ""),
        } for i in invites]


class RemoveMemberUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, group_id: str, caller_id: str, target_user_id: str) -> None:
        caller = self.repo.find_member(group_id, caller_id)
        if not caller or caller.get("role") != "admin":
            raise AuthorizationError("Only admins can remove members")

        group = self.repo.find_group(group_id)
        if group and group.get("creator_id") == target_user_id:
            raise ValidationError("Cannot remove the group creator")

        self.repo.delete_member(group_id, target_user_id)
        self.repo.increment_member_count(group_id, -1)


class ShareNoteToGroupUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, group_id: str, user_id: str, note_id: str) -> None:
        member = self.repo.find_member(group_id, user_id)
        if not member:
            raise AuthorizationError("Not a member of this group")

        # Look up note
        lookup = self.repo.find_note_lookup(note_id)
        if lookup:
            note_owner_id = lookup["user_id"]
        else:
            note_owner_id = user_id

        note = self.repo.find_note(note_owner_id, note_id)
        if not note:
            raise NotFoundError("Note not found")

        profile = self.repo.find_profile(user_id)
        shared_by_name = profile.get("display_name", "Student") if profile else "Student"

        gn = GroupNote(
            group_id=group_id, note_id=note_id,
            note_title=note.get("title", ""), note_owner_id=note_owner_id,
            shared_by=user_id, shared_by_name=shared_by_name,
        )
        self.repo.save_group_note(gn)


class DeleteGroupUseCase:
    def __init__(self, repo: DynamoGroupsRepository):
        self.repo = repo

    def execute(self, group_id: str, caller_id: str) -> None:
        group = self.repo.find_group(group_id)
        if not group:
            raise NotFoundError("Group not found")
        if group.get("creator_id") != caller_id:
            raise AuthorizationError("Only the creator can delete the group")
        self.repo.delete_group(group_id)
