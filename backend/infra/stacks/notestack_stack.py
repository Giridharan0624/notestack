from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy,
    CfnOutput,
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_s3 as s3,
    aws_lambda as _lambda,
    aws_apigateway as apigw,
    aws_cloudwatch as cloudwatch,
    aws_cloudwatch_actions as cw_actions,
    aws_iam as iam,
)
from constructs import Construct


class NoteStackStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ──────────────────────────────────────────────
        # Cognito User Pool
        # ──────────────────────────────────────────────
        user_pool = cognito.UserPool(
            self,
            "UserPool",
            user_pool_name="notestack-users",
            self_sign_up_enabled=True,
            sign_in_aliases=cognito.SignInAliases(email=True),
            auto_verify=cognito.AutoVerifiedAttrs(email=True),
            standard_attributes=cognito.StandardAttributes(
                email=cognito.StandardAttribute(required=True, mutable=True),
            ),
            password_policy=cognito.PasswordPolicy(
                min_length=8,
                require_lowercase=True,
                require_uppercase=True,
                require_digits=True,
                require_symbols=False,
            ),
            account_recovery=cognito.AccountRecovery.EMAIL_ONLY,
            removal_policy=RemovalPolicy.DESTROY,
        )

        user_pool_client = user_pool.add_client(
            "UserPoolClient",
            user_pool_client_name="notestack-web",
            auth_flows=cognito.AuthFlow(
                user_srp=True,
                user_password=True,
            ),
            prevent_user_existence_errors=True,
        )

        # ──────────────────────────────────────────────
        # DynamoDB Single Table
        # ──────────────────────────────────────────────
        table = dynamodb.Table(
            self,
            "Table",
            table_name="NoteStackTable",
            partition_key=dynamodb.Attribute(name="pk", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="sk", type=dynamodb.AttributeType.STRING),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY,
        )

        table.add_global_secondary_index(
            index_name="gsi1",
            partition_key=dynamodb.Attribute(name="gsi1pk", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="gsi1sk", type=dynamodb.AttributeType.STRING),
            projection_type=dynamodb.ProjectionType.ALL,
        )

        table.add_global_secondary_index(
            index_name="gsi2",
            partition_key=dynamodb.Attribute(name="gsi2pk", type=dynamodb.AttributeType.STRING),
            sort_key=dynamodb.Attribute(name="gsi2sk", type=dynamodb.AttributeType.STRING),
            projection_type=dynamodb.ProjectionType.ALL,
        )

        # ──────────────────────────────────────────────
        # S3 Bucket for File Uploads
        # ──────────────────────────────────────────────
        bucket = s3.Bucket(
            self,
            "UploadsBucket",
            bucket_name=None,  # Auto-generated
            cors=[
                s3.CorsRule(
                    allowed_methods=[s3.HttpMethods.PUT, s3.HttpMethods.GET],
                    allowed_origins=["*"],  # Tighten in production
                    allowed_headers=["*"],
                    max_age=3600,
                )
            ],
            block_public_access=s3.BlockPublicAccess.BLOCK_ALL,
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            lifecycle_rules=[
                s3.LifecycleRule(
                    abort_incomplete_multipart_upload_after=Duration.days(1),
                ),
            ],
        )

        # ──────────────────────────────────────────────
        # Lambda Layer (shared dependencies)
        # ──────────────────────────────────────────────
        deps_layer = _lambda.LayerVersion(
            self,
            "DepsLayer",
            code=_lambda.Code.from_asset("../lambda_layer"),
            compatible_runtimes=[_lambda.Runtime.PYTHON_3_11],
            description="NoteStack Python dependencies (pydantic, python-jose)",
        )

        # ──────────────────────────────────────────────
        # Lambda Functions (one per bounded context)
        # ──────────────────────────────────────────────
        lambda_defaults = {
            "runtime": _lambda.Runtime.PYTHON_3_11,
            "timeout": Duration.seconds(30),
            "memory_size": 256,
            "layers": [deps_layer],
            "environment": {
                "TABLE_NAME": table.table_name,
                "BUCKET_NAME": bucket.bucket_name,
            },
        }

        note_fn = _lambda.Function(
            self,
            "NoteFn",
            function_name="notestack-note",
            handler="contexts.note.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        upload_fn = _lambda.Function(
            self,
            "UploadFn",
            function_name="notestack-upload",
            handler="contexts.upload.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        attachment_fn = _lambda.Function(
            self,
            "AttachmentFn",
            function_name="notestack-attachment",
            handler="contexts.attachment.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        user_env = {**lambda_defaults["environment"], "USER_POOL_ID": user_pool.user_pool_id}
        user_fn = _lambda.Function(
            self,
            "UserFn",
            function_name="notestack-user",
            handler="contexts.user.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            runtime=lambda_defaults["runtime"],
            timeout=lambda_defaults["timeout"],
            memory_size=lambda_defaults["memory_size"],
            environment=user_env,
        )

        profile_fn = _lambda.Function(
            self,
            "ProfileFn",
            function_name="notestack-profile",
            handler="contexts.profile.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        feed_fn = _lambda.Function(
            self,
            "FeedFn",
            function_name="notestack-feed",
            handler="contexts.feed.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        # IAM permissions
        table.grant_read_write_data(note_fn)
        table.grant_read_write_data(attachment_fn)
        table.grant_read_write_data(profile_fn)
        table.grant_read_data(feed_fn)
        bucket.grant_put(upload_fn)
        bucket.grant_read(attachment_fn)
        bucket.grant_put(attachment_fn)

        # Grant user Lambda permission to read/delete Cognito users
        user_fn.add_to_role_policy(
            iam.PolicyStatement(
                actions=[
                    "cognito-idp:AdminGetUser",
                    "cognito-idp:AdminDeleteUser",
                ],
                resources=[user_pool.user_pool_arn],
            )
        )

        # ──────────────────────────────────────────────
        # API Gateway
        # ──────────────────────────────────────────────
        api = apigw.RestApi(
            self,
            "Api",
            rest_api_name="notestack-api",
            default_cors_preflight_options=apigw.CorsOptions(
                allow_origins=apigw.Cors.ALL_ORIGINS,
                allow_methods=apigw.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "Authorization"],
            ),
        )

        # Cognito authorizer
        authorizer = apigw.CognitoUserPoolsAuthorizer(
            self,
            "CognitoAuthorizer",
            cognito_user_pools=[user_pool],
        )
        # User routes
        me_resource = api.root.add_resource("me")
        me_resource.add_method(
            "GET",
            apigw.LambdaIntegration(user_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        me_resource.add_method(
            "DELETE",
            apigw.LambdaIntegration(user_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # Note routes
        notes_resource = api.root.add_resource("notes")
        notes_resource.add_method(
            "POST",
            apigw.LambdaIntegration(note_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        notes_resource.add_method(
            "GET",
            apigw.LambdaIntegration(note_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        note_id_resource = notes_resource.add_resource("{id}")
        note_id_resource.add_method(
            "PUT",
            apigw.LambdaIntegration(note_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        note_id_resource.add_method(
            "DELETE",
            apigw.LambdaIntegration(note_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # Upload route
        upload_resource = api.root.add_resource("upload-url")
        upload_resource.add_method(
            "POST",
            apigw.LambdaIntegration(upload_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # Attachment routes
        attachments_resource = note_id_resource.add_resource("attachments")
        attachments_resource.add_method(
            "POST",
            apigw.LambdaIntegration(attachment_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        attachments_resource.add_method(
            "GET",
            apigw.LambdaIntegration(attachment_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        attachment_id_resource = attachments_resource.add_resource("{attachmentId}")
        attachment_id_resource.add_method(
            "DELETE",
            apigw.LambdaIntegration(attachment_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # Feed routes (public — no authorizer)
        feed_resource = api.root.add_resource("feed")
        feed_resource.add_method("GET", apigw.LambdaIntegration(feed_fn))

        feed_notes_resource = feed_resource.add_resource("notes")
        feed_note_id_resource = feed_notes_resource.add_resource("{noteId}")
        feed_note_id_resource.add_method("GET", apigw.LambdaIntegration(feed_fn))

        # Users routes (public — no authorizer)
        users_resource = api.root.add_resource("users")
        user_id_resource = users_resource.add_resource("{userId}")
        user_id_resource.add_method("GET", apigw.LambdaIntegration(profile_fn))

        user_notes_resource = user_id_resource.add_resource("notes")
        user_notes_resource.add_method("GET", apigw.LambdaIntegration(feed_fn))

        # Profile routes (authenticated)
        me_profile_resource = me_resource.add_resource("profile")
        me_profile_resource.add_method(
            "GET",
            apigw.LambdaIntegration(profile_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        me_profile_resource.add_method(
            "PUT",
            apigw.LambdaIntegration(profile_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # ──────────────────────────────────────────────
        # CloudWatch Alarms
        # ──────────────────────────────────────────────
        for fn_name, fn in [("user", user_fn), ("note", note_fn), ("upload", upload_fn), ("attachment", attachment_fn), ("profile", profile_fn), ("feed", feed_fn)]:
            cloudwatch.Alarm(
                self,
                f"{fn_name.capitalize()}ErrorAlarm",
                metric=fn.metric_errors(period=Duration.minutes(5)),
                threshold=5,
                evaluation_periods=1,
                alarm_description=f"Lambda {fn_name} error rate alarm",
            )

        api.metric_server_error(period=Duration.minutes(5))
        cloudwatch.Alarm(
            self,
            "Api5xxAlarm",
            metric=api.metric_server_error(period=Duration.minutes(5)),
            threshold=10,
            evaluation_periods=1,
            alarm_description="API Gateway 5xx error alarm",
        )

        # ──────────────────────────────────────────────
        # Outputs
        # ──────────────────────────────────────────────
        CfnOutput(self, "ApiUrl", value=api.url)
        CfnOutput(self, "UserPoolId", value=user_pool.user_pool_id)
        CfnOutput(self, "UserPoolClientId", value=user_pool_client.user_pool_client_id)
        CfnOutput(self, "BucketName", value=bucket.bucket_name)
        CfnOutput(self, "TableName", value=table.table_name)
