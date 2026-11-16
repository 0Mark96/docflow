-- Tenant isolation for companies and profiles. Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(11);

-- Two synthetic users: the sign-up trigger creates a company and a profile for each.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'uno@test.example', '{"company_name":"Azienda Uno"}'),
  ('aaaaaaaa-0000-4000-8000-000000000002', 'due@test.example', '{}');

select is(
  (select count(*)::int from public.profiles
   where user_id in ('aaaaaaaa-0000-4000-8000-000000000001', 'aaaaaaaa-0000-4000-8000-000000000002')),
  2, 'sign-up creates one profile per user');

select isnt(
  (select company_id from public.profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  (select company_id from public.profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000002'),
  'each new user gets their own company');

select is(
  (select c.name from public.companies c join public.profiles p on p.company_id = c.id
   where p.user_id = 'aaaaaaaa-0000-4000-8000-000000000002'),
  'Azienda di due@test.example', 'without company_name the company gets a placeholder name');

-- Act as user one.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is(
  public.current_company_id(),
  (select company_id from public.profiles where user_id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  'current_company_id() returns the company of the logged-in user');

select results_eq('select name from public.companies', $$values ('Azienda Uno'::text)$$,
  'a user sees only their own company');

select is((select count(*)::int from public.profiles), 1, 'a user sees only their own profile');

select throws_ok(
  $$insert into public.companies (name) values ('Intrusa')$$, '42501', null,
  'a user cannot create companies');

select throws_ok(
  $$update public.profiles set company_id = gen_random_uuid()$$, '42501', null,
  'a user cannot move their profile to another company');

-- Act as a logged-out visitor.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok('select * from public.companies', '42501', null,
  'logged-out visitors cannot read companies');

select throws_ok('select public.current_company_id()', '42501', null,
  'logged-out visitors cannot call current_company_id()');

reset role;
select is(
  (select count(*)::int from public.companies c
   where not exists (select 1 from public.profiles p where p.company_id = c.id)),
  0, 'no company without members');

select * from finish();
rollback;
