#!/usr/bin/env python3
import aws_cdk as cdk

from stacks.notestack_stack import NoteStackStack

app = cdk.App()
NoteStackStack(app, "notestack-giri")
app.synth()
