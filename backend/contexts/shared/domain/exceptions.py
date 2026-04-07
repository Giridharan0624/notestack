class DomainError(Exception):
    """Base exception for domain errors."""

    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class NotFoundError(DomainError):
    """Resource not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class AuthorizationError(DomainError):
    """User not authorized."""

    def __init__(self, message: str = "Not authorized"):
        super().__init__(message, status_code=403)


class ValidationError(DomainError):
    """Input validation failed."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=400)
