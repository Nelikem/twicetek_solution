-- Core enumerated types used across the tenant hierarchy schema.

create type organization_status as enum ('draft', 'active', 'suspended', 'archived');

create type member_status as enum ('invited', 'active', 'suspended');

create type invitation_status as enum ('pending', 'accepted', 'revoked', 'expired');

create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');

create type billing_cycle as enum ('monthly', 'annual');
