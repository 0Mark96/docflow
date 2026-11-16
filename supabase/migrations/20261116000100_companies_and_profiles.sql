-- Companies (tenants) and user profiles, ADR 0004.
-- Every user belongs to exactly one company (MVP). Later tables scope their RLS policies
-- with public.current_company_id().

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 200),
  created_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index profiles_company_id_idx on public.profiles (company_id);

-- The company of the user making the request, or null when there is no logged-in user.
-- security definer: it reads profiles without going through the profiles policies,
-- so policies on other tables can call it without recursion.
create function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select p.company_id
  from public.profiles p
  where p.user_id = auth.uid()
$$;

revoke execute on function public.current_company_id() from public, anon;
grant execute on function public.current_company_id() to authenticated;

-- Row Level Security: a user reads only their own company and their own profile.
-- No insert, update or delete policies: rows are created by the trigger below,
-- never by the browser.
alter table public.companies enable row level security;
alter table public.profiles enable row level security;

create policy "companies: members read their company"
  on public.companies for select
  to authenticated
  using (id = (select public.current_company_id()));

create policy "profiles: users read their own profile"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.companies from anon;
revoke all on public.profiles from anon;
revoke insert, update, delete, truncate on public.companies from authenticated;
revoke insert, update, delete, truncate on public.profiles from authenticated;

-- Sign-up: the first login of a new email creates a company and the user's profile.
-- The company name can be passed as user metadata (company_name), for example by the
-- seed; otherwise it is a placeholder built from the email.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company_id uuid;
  company_name text;
begin
  company_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'company_name'), ''),
    'Azienda di ' || coalesce(new.email, 'nuovo utente')
  );

  insert into public.companies (name)
  values (left(company_name, 200))
  returning id into new_company_id;

  insert into public.profiles (user_id, company_id)
  values (new.id, new_company_id);

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
