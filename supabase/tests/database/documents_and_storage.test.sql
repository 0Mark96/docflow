-- Tenant isolation for documents and their files. Run with: npx supabase test db
begin;
create extension if not exists pgtap with schema extensions;

select plan(16);

-- Two synthetic users: the sign-up trigger creates a company for each.
insert into auth.users (id, email, raw_user_meta_data)
values
  ('bbbbbbbb-0000-4000-8000-000000000001', 'uno@test.example', '{"company_name":"Azienda Uno"}'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'due@test.example', '{"company_name":"Azienda Due"}');

create temporary table t_ids on commit drop as
select
  (select company_id from public.profiles where user_id = 'bbbbbbbb-0000-4000-8000-000000000001') as one,
  (select company_id from public.profiles where user_id = 'bbbbbbbb-0000-4000-8000-000000000002') as two;
grant select on t_ids to authenticated, anon;

select is(
  (select public from storage.buckets where id = 'documents'), false,
  'the documents bucket is private');

-- Act as user one.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-000000000001","role":"authenticated"}', true);

select lives_ok(
  format($$insert into public.documents (id, file_path, file_name, mime_type, size_bytes, content_sha256, kind)
    values ('dddddddd-0000-4000-8000-000000000001', '%s/dddddddd-0000-4000-8000-000000000001.pdf',
            'preventivo.pdf', 'application/pdf', 100, repeat('a', 64), 'pdf')$$, (select one from t_ids)),
  'a user adds a document to their company');

select is(
  (select row(company_id, created_by, status::text) from public.documents),
  row((select one from t_ids), 'bbbbbbbb-0000-4000-8000-000000000001'::uuid, 'uploaded'::text),
  'company, author and status are filled in by default');

select throws_ok(
  format($$insert into public.documents (company_id, file_path, file_name, mime_type, size_bytes, content_sha256, kind)
    values ('%1$s', '%1$s/x.pdf', 'x.pdf', 'application/pdf', 1, repeat('b', 64), 'pdf')$$, (select two from t_ids)),
  '42501', null,
  'a user cannot add a document to another company');

select throws_ok(
  format($$insert into public.documents (file_path, file_name, mime_type, size_bytes, content_sha256, kind)
    values ('%s/copia.pdf', 'copia.pdf', 'application/pdf', 100, repeat('a', 64), 'pdf')$$, (select one from t_ids)),
  '23505', null,
  'the same content cannot be stored twice in one company');

select throws_ok(
  format($$insert into public.documents (file_path, file_name, mime_type, size_bytes, content_sha256, kind)
    values ('%s/y.pdf', 'y.pdf', 'application/pdf', 1, repeat('c', 64), 'pdf')$$, (select two from t_ids)),
  '23514', null,
  'the file path must be in the company folder');

select lives_ok(
  format($$insert into storage.objects (bucket_id, name)
    values ('documents', '%s/dddddddd-0000-4000-8000-000000000001.pdf')$$, (select one from t_ids)),
  'a user uploads a file to their company folder');

select throws_ok(
  format($$insert into storage.objects (bucket_id, name) values ('documents', '%s/intruso.pdf')$$,
    (select two from t_ids)),
  '42501', null,
  'a user cannot upload a file to another company folder');

select throws_ok(
  $$update public.documents set status = 'ready'$$, '42501', null,
  'a user cannot change a document status');

-- Act as user two.
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-000000000002","role":"authenticated"}', true);

select is((select count(*)::int from public.documents), 0, 'another company sees no documents');
select is((select count(*)::int from storage.objects where bucket_id = 'documents'), 0,
  'another company sees no files');

delete from public.documents;

-- Back to user one.
select set_config('request.jwt.claims', '{"sub":"bbbbbbbb-0000-4000-8000-000000000001","role":"authenticated"}', true);

select is((select count(*)::int from public.documents), 1,
  'another company cannot delete the document');

delete from public.documents;

select is((select count(*)::int from public.documents), 0, 'a user deletes their document');

-- Storage blocks DELETE statements on its tables (files are removed through the
-- Storage API), so the delete rule for files is checked on the policy itself.
reset role;
select ok(
  exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and cmd = 'DELETE'
      and 'authenticated' = any (roles)
      and qual like '%bucket_id = ''documents''%'
      and qual like '%current_company_id()%'
  ),
  'files can be deleted only in the company folder');
set local role authenticated;

-- Act as a logged-out visitor.
reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

select throws_ok('select * from public.documents', '42501', null,
  'logged-out visitors cannot read documents');

select is((select count(*)::int from storage.objects where bucket_id = 'documents'), 0,
  'logged-out visitors see no files');

select * from finish();
rollback;
