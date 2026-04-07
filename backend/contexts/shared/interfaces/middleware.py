import json
import logging
import functools

from contexts.shared.domain.exceptions import DomainError
from contexts.shared.infrastructure.auth import extract_user_id
from contexts.shared.interfaces.api_response import error_response, success_response

logger = logging.getLogger(__name__)


def lambda_handler(func):
    """Decorator for Lambda handlers.

    Extracts userId from the event, parses JSON body,
    wraps response in proper API Gateway format, and handles errors.
    """

    @functools.wraps(func)
    def wrapper(event, context):
        # Handle OPTIONS preflight
        if event.get("httpMethod") == "OPTIONS":
            return success_response("")

        try:
            user_id = extract_user_id(event)

            body = None
            if event.get("body"):
                body = json.loads(event["body"])

            path_params = event.get("pathParameters") or {}
            query_params = event.get("queryStringParameters") or {}

            result = func(
                event=event,
                user_id=user_id,
                body=body,
                path_params=path_params,
                query_params=query_params,
            )
            return result

        except DomainError as e:
            logger.warning(f"Domain error: {e.message}")
            return error_response(e.message, e.status_code)

        except ValueError as e:
            logger.warning(f"Validation error: {str(e)}")
            return error_response(str(e), 400)

        except json.JSONDecodeError:
            return error_response("Invalid JSON body", 400)

        except Exception as e:
            logger.exception("Unhandled error")
            return error_response("Internal server error", 500)

    return wrapper


def public_lambda_handler(func):
    """Decorator for public Lambda handlers (no auth required)."""

    @functools.wraps(func)
    def wrapper(event, context):
        if event.get("httpMethod") == "OPTIONS":
            return success_response("")

        try:
            body = None
            if event.get("body"):
                body = json.loads(event["body"])

            path_params = event.get("pathParameters") or {}
            query_params = event.get("queryStringParameters") or {}

            result = func(
                event=event,
                user_id=None,
                body=body,
                path_params=path_params,
                query_params=query_params,
            )
            return result

        except DomainError as e:
            logger.warning(f"Domain error: {e.message}")
            return error_response(e.message, e.status_code)

        except ValueError as e:
            logger.warning(f"Validation error: {str(e)}")
            return error_response(str(e), 400)

        except json.JSONDecodeError:
            return error_response("Invalid JSON body", 400)

        except Exception as e:
            logger.exception("Unhandled error")
            return error_response("Internal server error", 500)

    return wrapper
