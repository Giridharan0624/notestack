def extract_user_id(event: dict) -> str:
    """Extract userId from API Gateway event with Cognito authorizer.

    The Cognito authorizer validates the JWT and passes claims
    in event['requestContext']['authorizer']['claims'].
    """
    try:
        claims = event["requestContext"]["authorizer"]["claims"]
        return claims["sub"]
    except (KeyError, TypeError):
        raise ValueError("Missing or invalid authorization claims")
