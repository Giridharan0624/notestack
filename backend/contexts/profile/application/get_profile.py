from contexts.profile.domain.profile_entity import Profile
from contexts.profile.domain.profile_repository import ProfileRepository


class GetProfileUseCase:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository

    def execute(self, user_id: str) -> Profile:
        profile = self.repository.find_by_user_id(user_id)
        if not profile:
            return Profile(user_id=user_id, display_name="Student")
        return profile
