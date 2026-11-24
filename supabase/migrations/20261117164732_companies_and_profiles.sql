-- Companies are the tenants: every user and every document belongs to one.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- One profile per user, linking the Supabase Auth user to their company (one company per user in the MVP).
create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  company_id uuid not null references public.companies (id),
  created_at timestamptz not null default now()
);

create index profiles_company_id_idx on public.profiles (company_id);

-- Company of the requesting user, or null when logged out. Used by RLS policies and column defaults.
-- security definer: reads profiles without going through its RLS policies, which call this function.
create function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select company_id from public.profiles where user_id = (select auth.uid())
$$;

revoke execute on function public.current_company_id() from public, anon;
grant execute on function public.current_company_id() to authenticated;

-- RLS: users read only their own company and profile. There are no insert, update or delete
-- policies, so clients cannot create or move them; the sign-up trigger does that.
alter table public.companies enable row level security;
alter table public.profiles enable row level security;

-- Defense in depth: table privileges match the policies, so a future permissive policy alone
-- cannot open writes to clients.
revoke all on public.companies, public.profiles from anon;
revoke insert, update, delete, truncate on public.companies, public.profiles from authenticated;

create policy "Users read their own company"
  on public.companies for select
  to authenticated
  using (id = (select public.current_company_id()));

create policy "Users read their own profile"
  on public.profiles for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Sign-up: every new Auth user gets a placeholder company and a profile in it.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_company_id uuid;
begin
  insert into public.companies (name)
  values ('Azienda di ' || coalesce(new.email, new.id::text))
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
