-- Documents uploaded by the users of a company, and the private Storage bucket
-- that holds their files. Depends on 20261116000100_companies_and_profiles.sql
-- (companies, profiles, public.current_company_id()).

create type public.document_kind as enum ('fatturapa', 'pdf', 'text');

-- uploaded: file stored, extraction not started; processing / ready / failed: set by extraction (M3).
create type public.document_status as enum ('uploaded', 'processing', 'ready', 'failed');

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null default public.current_company_id()
    references public.companies (id) on delete cascade,
  -- Storage object name in the "documents" bucket: <company_id>/<document_id>.<ext>
  file_path text not null unique,
  file_name text not null check (char_length(file_name) between 1 and 255),
  mime_type text not null,
  size_bytes integer not null check (size_bytes > 0),
  content_sha256 text not null check (content_sha256 ~ '^[0-9a-f]{64}$'),
  kind public.document_kind not null,
  status public.document_status not null default 'uploaded',
  error_message text,
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  -- The same file cannot be uploaded twice in one company.
  constraint documents_company_content_unique unique (company_id, content_sha256),
  constraint documents_file_path_in_company_folder
    check (split_part(file_path, '/', 1) = company_id::text)
);

create index documents_company_created_at_idx
  on public.documents (company_id, created_at desc);

-- Tables added later (extracted_fields, document_chunks) reference documents(id)
-- with "on delete cascade", so deleting a document removes its fields and chunks.

alter table public.documents enable row level security;

-- Logged-out visitors get no access at all; logged-in users cannot update (see below).
revoke all on public.documents from anon;
revoke update, truncate on public.documents from authenticated;

create policy "documents: members read their company's documents"
  on public.documents for select
  to authenticated
  using (company_id = public.current_company_id());

create policy "documents: members add documents to their company"
  on public.documents for insert
  to authenticated
  with check (
    company_id = public.current_company_id()
    and created_by = auth.uid()
  );

create policy "documents: members delete their company's documents"
  on public.documents for delete
  to authenticated
  using (company_id = public.current_company_id());

-- No update grant or policy: status and errors are written by the extraction
-- pipeline (M3), which adds its own policy or runs with server-side privileges.

-- Storage --------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  4194304, -- 4 MB, same as MAX_UPLOAD_BYTES in src/lib/documents/types.ts
  array['application/pdf', 'text/plain', 'application/xml']
)
on conflict (id) do nothing;

-- Objects live under a folder named after the company id: <company_id>/<file>.
create policy "documents bucket: members read their company's files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "documents bucket: members upload to their company's folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );

create policy "documents bucket: members delete their company's files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.current_company_id()::text
  );
