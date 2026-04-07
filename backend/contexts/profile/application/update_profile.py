from contexts.profile.domain.profile_entity import Profile
from contexts.profile.domain.profile_repository import ProfileRepository
from contexts.shared.domain.exceptions import ValidationError
from contexts.shared.domain.value_objects import now_iso


class UpdateProfileUseCase:
    def __init__(self, repository: ProfileRepository):
        self.repository = repository

    def execute(
        self,
        user_id: str,
        display_name: str | None = None,
        university: str | None = None,
        bio: str | None = None,
    ) -> Profile:
        profile = self.repository.find_by_user_id(user_id)
        if not profile:
            profile = Profile(user_id=user_id)

        if display_name is not None:
            if len(display_name) > 50:
                raise ValidationError("Display name must be 50 characters or less")
            profile.display_name = display_name.strip()

        if university is not None:
            if len(university) > 100:
                raise ValidationError("University must be 100 characters or less")
            profile.university = university.strip()

        if bio is not None:
            if len(bio) > 500:
                raise ValidationError("Bio must be 500 characters or less")
            profile.bio = bio.strip()

        profile.updated_at = now_iso()
        self.repository.save(profile)
        return profile
