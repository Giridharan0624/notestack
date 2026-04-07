import re

from contexts.profile.domain.profile_entity import Profile
from contexts.profile.infrastructure.dynamo_profile_repository import DynamoProfileRepository
from contexts.shared.domain.exceptions import ValidationError
from contexts.shared.domain.value_objects import now_iso

VALID_YEARS = ("", "Freshman", "Sophomore", "Junior", "Senior", "Graduate")
VALID_SOCIAL_KEYS = ("linkedin", "github", "instagram")
USERNAME_RE = re.compile(r"^[a-z0-9_]{3,20}$")


class UpdateProfileUseCase:
    def __init__(self, repository: DynamoProfileRepository):
        self.repository = repository

    def execute(
        self,
        user_id: str,
        username: str | None = None,
        display_name: str | None = None,
        university: str | None = None,
        bio: str | None = None,
        year_of_study: str | None = None,
        major: str | None = None,
        social_links: dict[str, str] | None = None,
    ) -> Profile:
        profile = self.repository.find_by_user_id(user_id)
        if not profile:
            profile = Profile(user_id=user_id)

        if username is not None:
            username = username.strip().lower()
            if username and not USERNAME_RE.match(username):
                raise ValidationError("Username must be 3-20 characters, lowercase letters, numbers, underscores only")
            if username and username != profile.username:
                # Release old username
                if profile.username:
                    self.repository.release_username(profile.username)
                # Claim new username
                if not self.repository.claim_username(username, user_id):
                    raise ValidationError("Username is already taken")
                profile.username = username

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

        if year_of_study is not None:
            if year_of_study not in VALID_YEARS:
                raise ValidationError(f"Year must be one of: {', '.join(VALID_YEARS[1:])}")
            profile.year_of_study = year_of_study

        if major is not None:
            if len(major) > 100:
                raise ValidationError("Major must be 100 characters or less")
            profile.major = major.strip()

        if social_links is not None:
            clean = {}
            for key, url in social_links.items():
                if key not in VALID_SOCIAL_KEYS:
                    continue
                url = url.strip()
                if url and not url.startswith("https://"):
                    raise ValidationError(f"Social link for {key} must start with https://")
                if url:
                    clean[key] = url
            profile.social_links = clean

        profile.updated_at = now_iso()
        self.repository.save(profile)
        return profile
