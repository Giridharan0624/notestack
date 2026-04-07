"""Local development server that simulates API Gateway -> Lambda routing.

Usage: python local_server.py
Runs on http://localhost:8000
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

os.environ.setdefault("TABLE_NAME", "NoteStackTable")
os.environ.setdefault("BUCKET_NAME", "notestack-uploads")
os.environ.setdefault("USER_POOL_ID", "local-pool")

from contexts.note.interfaces.handlers import handler as note_handler
from contexts.upload.interfaces.handlers import handler as upload_handler
from contexts.attachment.interfaces.handlers import handler as attachment_handler
from contexts.profile.interfaces.handlers import handler as profile_handler
from contexts.feed.interfaces.handlers import handler as feed_handler

DEV_CLAIMS = {"sub": "local-dev-user", "email": "dev@local.test"}


class RequestHandler(BaseHTTPRequestHandler):
    def _handle(self, method: str):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length else None

        path = self.path.split("?")[0]
        query_string = self.path.split("?")[1] if "?" in self.path else ""
        query_params = {}
        if query_string:
            for pair in query_string.split("&"):
                if "=" in pair:
                    k, v = pair.split("=", 1)
                    query_params[k] = v

        parts = path.strip("/").split("/")
        path_params = {}
        resource = path
        handler_fn = None

        # Feed routes
        if parts[0] == "feed" and len(parts) == 1:
            resource = "/feed"
            handler_fn = feed_handler
        elif parts[0] == "feed" and len(parts) == 3 and parts[1] == "notes":
            resource = "/feed/notes/{noteId}"
            path_params["noteId"] = parts[2]
            handler_fn = feed_handler

        # User routes
        elif parts[0] == "users" and len(parts) == 2:
            resource = "/users/{userId}"
            path_params["userId"] = parts[1]
            handler_fn = profile_handler
        elif parts[0] == "users" and len(parts) == 3 and parts[2] == "notes":
            resource = "/users/{userId}/notes"
            path_params["userId"] = parts[1]
            handler_fn = feed_handler

        # Profile routes (me)
        elif parts[0] == "me" and len(parts) == 1:
            resource = "/me"
            from contexts.user.interfaces.handlers import handler as user_handler
            handler_fn = user_handler
        elif parts[0] == "me" and len(parts) == 2 and parts[1] == "profile":
            resource = "/me/profile"
            handler_fn = profile_handler

        # Notes routes
        elif parts[0] == "notes" and len(parts) == 1:
            resource = "/notes"
            handler_fn = note_handler
        elif parts[0] == "notes" and len(parts) == 2:
            resource = "/notes/{id}"
            path_params["id"] = parts[1]
            handler_fn = note_handler

        # Upload
        elif parts[0] == "upload-url":
            resource = "/upload-url"
            handler_fn = upload_handler

        # Attachment routes
        elif parts[0] == "notes" and len(parts) >= 3 and parts[2] == "attachments":
            path_params["id"] = parts[1]
            if len(parts) == 3:
                resource = "/notes/{id}/attachments"
                handler_fn = attachment_handler
            elif len(parts) == 4:
                resource = "/notes/{id}/attachments/{attachmentId}"
                path_params["attachmentId"] = parts[3]
                handler_fn = attachment_handler

        if not handler_fn:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(b'{"error": "Not found"}')
            return

        event = {
            "httpMethod": method,
            "resource": resource,
            "path": path,
            "body": body,
            "pathParameters": path_params if path_params else None,
            "queryStringParameters": query_params if query_params else None,
            "requestContext": {
                "authorizer": {"claims": DEV_CLAIMS}
            },
        }

        result = handler_fn(event, None)
        self.send_response(result["statusCode"])
        for k, v in result.get("headers", {}).items():
            self.send_header(k, v)
        self.end_headers()
        self.wfile.write(result.get("body", "").encode())

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def do_PUT(self):
        self._handle("PUT")

    def do_DELETE(self):
        self._handle("DELETE")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        self.end_headers()


if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", 8000), RequestHandler)
    print("Local dev server running at http://localhost:8000")
    print("Using dev user: local-dev-user")
    print("\nRoutes:")
    print("  GET    /feed              - Public notes feed")
    print("  GET    /feed/notes/{id}   - Single public note")
    print("  GET    /users/{id}        - User profile")
    print("  GET    /users/{id}/notes  - User's public notes")
    print("  GET    /me/profile        - Own profile")
    print("  PUT    /me/profile        - Update profile")
    print("  POST   /notes             - Create note")
    print("  GET    /notes             - List own notes")
    print("  PUT    /notes/{id}        - Update note")
    print("  DELETE /notes/{id}        - Delete note")
    print("  POST   /upload-url        - Get upload URL")
    server.serve_forever()
