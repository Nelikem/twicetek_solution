-- Extensions required by this schema.
-- pgcrypto: gen_random_uuid() for primary key defaults.
-- citext: case-insensitive text type used for email columns.
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
