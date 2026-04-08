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

        social_fn = _lambda.Function(
            self,
            "SocialFn",
            function_name="notestack-social",
            handler="contexts.social.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        sharing_fn = _lambda.Function(
            self, "SharingFn", function_name="notestack-sharing",
            handler="contexts.sharing.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        groups_fn = _lambda.Function(
            self, "GroupsFn", function_name="notestack-groups",
            handler="contexts.groups.interfaces.handlers.handler",
            code=_lambda.Code.from_asset("..", exclude=["infra", "tests", "lambda_layer", "local_server.py", ".pytest_cache", "__pycache__", "*.dist-info"]),
            **lambda_defaults,
        )

        # IAM permissions
        table.grant_read_write_data(note_fn)
        table.grant_read_write_data(attachment_fn)
        table.grant_read_write_data(profile_fn)
        table.grant_read_write_data(social_fn)
        table.grant_read_write_data(sharing_fn)
        table.grant_read_write_data(groups_fn)
        table.grant_read_data(feed_fn)
        bucket.grant_read(feed_fn)
        bucket.grant_put(profile_fn)
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
            deploy_options=apigw.StageOptions(
                throttling_rate_limit=100,
                throttling_burst_limit=200,
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
            "GET",
            apigw.LambdaIntegration(note_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
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

        download_resource = attachment_id_resource.add_resource("download")
        download_resource.add_method(
            "GET",
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

        # Public attachments for feed notes (no auth)
        feed_att_resource = feed_note_id_resource.add_resource("attachments")
        feed_att_resource.add_method("GET", apigw.LambdaIntegration(feed_fn))

        feed_att_id_resource = feed_att_resource.add_resource("{attachmentId}")
        feed_att_download_resource = feed_att_id_resource.add_resource("download")
        feed_att_download_resource.add_method("GET", apigw.LambdaIntegration(feed_fn))

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

        # Avatar routes (authenticated)
        me_avatar_url_resource = me_resource.add_resource("avatar-upload-url")
        me_avatar_url_resource.add_method(
            "POST",
            apigw.LambdaIntegration(profile_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )
        me_avatar_resource = me_resource.add_resource("avatar")
        me_avatar_resource.add_method(
            "PUT",
            apigw.LambdaIntegration(profile_fn),
            authorization_type=apigw.AuthorizationType.COGNITO,
            authorizer=authorizer,
        )

        # Username lookup (public)
        u_resource = api.root.add_resource("u")
        u_username_resource = u_resource.add_resource("{username}")
        u_username_resource.add_method("GET", apigw.LambdaIntegration(profile_fn))

        # Stats route (public)
        user_stats_resource = user_id_resource.add_resource("stats")
        user_stats_resource.add_method("GET", apigw.LambdaIntegration(profile_fn))

        # Social routes — follow
        follow_resource = user_id_resource.add_resource("follow")
        follow_resource.add_method("POST", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)
        follow_resource.add_method("DELETE", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        followers_resource = user_id_resource.add_resource("followers")
        followers_resource.add_method("GET", apigw.LambdaIntegration(social_fn))

        following_resource = user_id_resource.add_resource("following")
        following_resource.add_method("GET", apigw.LambdaIntegration(social_fn))

        # Social routes — like & bookmark (under notes/{id})
        like_resource = note_id_resource.add_resource("like")
        like_resource.add_method("POST", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)
        like_resource.add_method("DELETE", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        bookmark_resource = note_id_resource.add_resource("bookmark")
        bookmark_resource.add_method("POST", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)
        bookmark_resource.add_method("DELETE", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # Social routes — bookmarks & status (under /me)
        me_bookmarks_resource = me_resource.add_resource("bookmarks")
        me_bookmarks_resource.add_method("GET", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        me_social_status_resource = me_resource.add_resource("social-status")
        me_social_status_resource.add_method("GET", apigw.LambdaIntegration(social_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # Sharing routes — note share
        share_resource = note_id_resource.add_resource("share")
        share_resource.add_method("POST", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # Sharing routes — notifications (under /me)
        me_notifications_resource = me_resource.add_resource("notifications")
        me_notifications_resource.add_method("GET", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        me_notif_unread_resource = me_notifications_resource.add_resource("unread-count")
        me_notif_unread_resource.add_method("GET", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        me_notif_id_resource = me_notifications_resource.add_resource("{shareId}")
        me_notif_read_resource = me_notif_id_resource.add_resource("read")
        me_notif_read_resource.add_method("PUT", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # Shared with me routes
        me_shared_resource = me_resource.add_resource("shared-with-me")
        me_shared_resource.add_method("GET", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        me_shared_note_resource = me_shared_resource.add_resource("{noteId}")
        me_shared_note_resource.add_method("GET", apigw.LambdaIntegration(sharing_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # User search (under /users)
        users_search_resource = users_resource.add_resource("search")
        users_search_resource.add_method("GET", apigw.LambdaIntegration(profile_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # Groups routes
        groups_resource = api.root.add_resource("groups")
        groups_resource.add_method("POST", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        me_groups_resource = me_resource.add_resource("groups")
        me_groups_resource.add_method("GET", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        group_id_resource = groups_resource.add_resource("{groupId}")
        group_id_resource.add_method("GET", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)
        group_id_resource.add_method("DELETE", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        group_members_resource = group_id_resource.add_resource("members")
        group_members_resource.add_method("POST", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        group_member_id_resource = group_members_resource.add_resource("{userId}")
        group_member_id_resource.add_method("DELETE", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        group_notes_resource = group_id_resource.add_resource("notes")
        group_notes_resource.add_method("POST", apigw.LambdaIntegration(groups_fn), authorization_type=apigw.AuthorizationType.COGNITO, authorizer=authorizer)

        # ──────────────────────────────────────────────
        # CloudWatch Alarms
        # ──────────────────────────────────────────────
        for fn_name, fn in [("user", user_fn), ("note", note_fn), ("upload", upload_fn), ("attachment", attachment_fn), ("profile", profile_fn), ("feed", feed_fn), ("social", social_fn), ("sharing", sharing_fn), ("groups", groups_fn)]:
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
