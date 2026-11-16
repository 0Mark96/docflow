-- Synthetic demo users for local development (never real people or companies).
-- Two users in two different companies, to see tenant isolation at work.
-- Log in at http://localhost:3000 with one of these emails and open the link
-- from the local mailbox (Mailpit, http://127.0.0.1:54324).

insert into auth.users (
  instance_id, id, aud, role, email, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
values
  (
    '00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated', 'anna@officina-esempio.test', now(),
    '{"provider":"email","providers":["email"]}', '{"company_name":"Officina Esempio S.r.l."}',
    now(), now(), '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated', 'luca@studio-demo.test', now(),
    '{"provider":"email","providers":["email"]}', '{"company_name":"Studio Demo S.a.s."}',
    now(), now(), '', '', '', ''
  );

insert into auth.identities (
  id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at
)
select
  gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
  now(), now(), now()
from auth.users u
where u.id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');
