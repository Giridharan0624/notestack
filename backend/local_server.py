"""Local development server that simulates API Gateway → Lambda routing.

Usage: python local_server.py
Runs on http://localhost:8000
"""

import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

os.environ.setdefault("TABLE_NAME", "NoteStackTable")
os.environ.setdefault("BUCKET_NAME", "notestack-uploads")

from contexts.note.interfaces.handlers import handler as note_handler
from contexts.upload.interfaces.handlers import handler as upload_handler
from contexts.attachment.interfaces.handlers import handler as attachment_handler

ROUTES = [
    ("POST", "/notes", "/notes", note_handler),
    ("GET", "/notes", "/notes", note_handler),
    ("PUT", "/notes/", "/notes/{id}", note_handler),
    ("DELETE", "/notes/", "/notes/{id}", note_handler),
    ("POST", "/upload-url", "/upload-url", upload_handler),
    ("POST", "/notes/", "/notes/{id}/attachments", attachment_handler),
    ("GET", "/notes/", "/notes/{id}/attachments", attachment_handler),
    ("DELETE", "/notes/", "/notes/{id}/attachments/", attachment_handler),
]


class RequestHandler(BaseHTTPRequestHandler):
    def _handle(self, method: str):
        # Read body
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length else None

        # Parse path
        path = self.path.split("?")[0]
        parts = path.strip("/").split("/")

        # Build path params and find resource
        path_params = {}
        resource = path
        handler_fn = None

        if parts[0] == "notes" and len(parts) == 1:
            resource = "/notes"
            handler_fn = note_handler
        elif parts[0] == "notes" and len(parts) == 2:
            resource = "/notes/{id}"
            path_params["id"] = parts[1]
            handler_fn = note_handler
        elif parts[0] == "upload-url":
            resource = "/upload-url"
            handler_fn = upload_handler
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

        # Build API Gateway-like event
        event = {
            "httpMethod": method,
            "resource": resource,
            "path": path,
            "body": body,
            "pathParameters": path_params if path_params else None,
            "queryStringParameters": None,
            "requestContext": {
                "authorizer": {
                    "claims": {"sub": "local-dev-user", "email": "dev@local.test"}
                }
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
    server.serve_forever()
