from abc import ABC, abstractmethod

from contexts.profile.domain.profile_entity import Profile


class ProfileRepository(ABC):
    @abstractmethod
    def save(self, profile: Profile) -> None:
        pass

    @abstractmethod
    def find_by_user_id(self, user_id: str) -> Profile | None:
        pass
