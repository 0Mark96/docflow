-- Tenant isolation for companies and profiles: sign-up trigger, RLS and table privileges.
begin;
create extension if not exists pgtap with schema extensions;

select plan(14);

-- Fixtures: two users signing up. The trigger creates their companies and profiles.
insert into auth.users (id, email) values
  ('a1111111-1111-4111-8111-111111111111', 'test.a@example.com'),
  ('b2222222-2222-4222-8222-222222222222', 'test.b@example.com');

-- Sign-up trigger
select is(
  (select c.name from public.profiles p join public.companies c on c.id = p.company_id
   where p.user_id = 'a1111111-1111-4111-8111-111111111111'),
  'Azienda di test.a@example.com',
  'sign-up creates a placeholder company and a profile'
);
select isnt(
  (select company_id from public.profiles where user_id = 'a1111111-1111-4111-8111-111111111111'),
  (select company_id from public.profiles where user_id = 'b2222222-2222-4222-8222-222222222222'),
  'each new user gets their own company'
);

-- RLS is enabled
select ok(
  (select relrowsecurity from pg_class where oid = 'public.companies'::regclass),
  'RLS is enabled on companies'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'RLS is enabled on profiles'
);

-- Logged in as user A
set local role authenticated;
select set_config('request.jwt.claims', '{"sub": "a1111111-1111-4111-8111-111111111111", "role": "authenticated"}', true);

select is(
  public.current_company_id(),
  (select company_id from public.profiles where user_id = 'a1111111-1111-4111-8111-111111111111'),
  'current_company_id() returns the company of the requesting user'
);
select results_eq(
  'select name from public.companies',
  $$values ('Azienda di test.a@example.com')$$,
  'a user reads only their own company'
);
select results_eq(
  'select user_id from public.profiles',
  $$values ('a1111111-1111-4111-8111-111111111111'::uuid)$$,
  'a user reads only their own profile'
);
select throws_ok(
  $$insert into public.companies (name) values ('Another company')$$,
  '42501',
  null,
  'a user cannot create a company'
);
select throws_ok(
  $$update public.companies set name = 'Renamed'$$,
  '42501',
  null,
  'a user cannot rename a company'
);
select throws_ok(
  $$insert into public.profiles (user_id, company_id) values ('b2222222-2222-4222-8222-222222222222', public.current_company_id())$$,
  '42501',
  null,
  'a user cannot create a profile'
);
select throws_ok(
  $$update public.profiles set company_id = gen_random_uuid()$$,
  '42501',
  null,
  'a user cannot move to another company'
);
select throws_ok(
  $$delete from public.companies$$,
  '42501',
  null,
  'a user cannot delete a company'
);

-- Logged out
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok(
  'select * from public.companies',
  '42501',
  null,
  'a logged-out visitor cannot read companies'
);
select throws_ok(
  'select * from public.profiles',
  '42501',
  null,
  'a logged-out visitor cannot read profiles'
);

reset role;
select * from finish();
rollback;
