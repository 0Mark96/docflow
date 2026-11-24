-- Local development data: two synthetic users in two companies.
-- Applied by `npx supabase db reset` after the migrations. Never used in production.
-- Log in with either email through the magic link; the email arrives in Mailpit.

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  phone_change, phone_change_token, email_change_token_current, reauthentication_token
)
values
  (
    '00000000-0000-0000-0000-000000000000', '11111111-1111-4111-8111-111111111111',
    'authenticated', 'authenticated', 'mario.rossi@example.com', '', now(),
    '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
    '', '', '', '', '', '', '', ''
  ),
  (
    '00000000-0000-0000-0000-000000000000', '22222222-2222-4222-8222-222222222222',
    'authenticated', 'authenticated', 'lucia.bianchi@example.com', '', now(),
    '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
    '', '', '', '', '', '', '', ''
  );

insert into auth.identities (user_id, provider_id, provider, identity_data, created_at, updated_at)
select id, id::text, 'email', jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true), now(), now()
from auth.users
where id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');

-- The sign-up trigger created a placeholder company for each user; give them realistic names.
update public.companies c
set name = case p.user_id
  when '11111111-1111-4111-8111-111111111111' then 'Rossi Forniture Srl'
  when '22222222-2222-4222-8222-222222222222' then 'Studio Bianchi'
end
from public.profiles p
where p.company_id = c.id
  and p.user_id in ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222');
