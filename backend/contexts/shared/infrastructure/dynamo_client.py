import os

import boto3

_table = None


def get_table():
    global _table
    if _table is None:
        table_name = os.environ.get("TABLE_NAME", "NoteStackTable")
        dynamodb = boto3.resource("dynamodb")
        _table = dynamodb.Table(table_name)
    return _table
