from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Str(data_key='_id', dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    hashed_password = fields.Str(required=True, load_only=True)

class UserInSchema(Schema):
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class UserOutSchema(Schema):
    id = fields.Str(data_key='_id', required=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)

class LoginRequestSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)

class TokenSchema(Schema):
    access_token = fields.Str(required=True)
    token_type = fields.Str(required=True)

class TodoInSchema(Schema):
    title = fields.Str(required=True)
    description = fields.Str(required=True)

class TodoUpdateSchema(Schema):
    title = fields.Str()
    description = fields.Str()
    completed = fields.Bool()

class TodoOutSchema(Schema):
    id = fields.Str(data_key='_id', required=True)
    title = fields.Str(required=True)
    description = fields.Str(required=True)
    completed = fields.Bool(required=True)
    user_id = fields.Str(required=True)