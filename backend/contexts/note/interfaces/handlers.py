from contexts.note.application.create_note import CreateNoteUseCase
from contexts.note.application.delete_note import DeleteNoteUseCase
from contexts.note.application.get_note import GetNoteUseCase
from contexts.note.application.get_notes import GetNotesUseCase
from contexts.note.application.update_note import UpdateNoteUseCase
from contexts.note.infrastructure.dynamo_note_repository import DynamoNoteRepository
from contexts.profile.infrastructure.dynamo_profile_repository import DynamoProfileRepository
from contexts.shared.interfaces.api_response import error_response, success_response
from contexts.shared.interfaces.middleware import lambda_handler

repo = DynamoNoteRepository()
profile_repo = DynamoProfileRepository()


def handler(event, context):
    method = event.get("httpMethod", "")
    resource = event.get("resource", "")

    routes = {
        ("POST", "/notes"): create_note,
        ("GET", "/notes"): get_notes,
        ("PUT", "/notes/{id}"): update_note,
        ("DELETE", "/notes/{id}"): delete_note,
    }

    handler_fn = routes.get((method, resource))
    if handler_fn is None:
        if method == "OPTIONS":
            return success_response("")
        return error_response("Not found", 404)

    return handler_fn(event, context)


@lambda_handler
def create_note(event, user_id, body, path_params, query_params):
    # Get author display name from profile
    profile = profile_repo.find_by_user_id(user_id)
    display_name = profile.display_name if profile and profile.display_name else "Student"

    use_case = CreateNoteUseCase(repo)
    note = use_case.execute(
        user_id=user_id,
        title=body.get("title", ""),
        content=body.get("content", ""),
        description=body.get("description", ""),
        subject=body.get("subject", ""),
        visibility=body.get("visibility", "private"),
        author_display_name=display_name,
    )
    return success_response(note.to_api_dict(), 201)


@lambda_handler
def get_notes(event, user_id, body, path_params, query_params):
    use_case = GetNotesUseCase(repo)
    notes = use_case.execute(user_id)
    return success_response([n.to_api_dict() for n in notes])


@lambda_handler
def update_note(event, user_id, body, path_params, query_params):
    note_id = path_params.get("id")
    use_case = UpdateNoteUseCase(repo)
    note = use_case.execute(
        user_id=user_id,
        note_id=note_id,
        title=body.get("title"),
        content=body.get("content"),
        description=body.get("description"),
        subject=body.get("subject"),
        visibility=body.get("visibility"),
    )
    return success_response(note.to_api_dict())


@lambda_handler
def delete_note(event, user_id, body, path_params, query_params):
    note_id = path_params.get("id")
    use_case = DeleteNoteUseCase(repo)
    use_case.execute(user_id=user_id, note_id=note_id)
    return success_response({"message": "Note deleted"})
