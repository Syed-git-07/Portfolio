-- Run in your own Supabase SQL editor. No service-role key belongs in the frontend.
begin;
create table if not exists public.portfolio_owners (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.portfolio_owners enable row level security;
revoke all on public.portfolio_owners from anon, authenticated;

create or replace function public.is_portfolio_owner() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.portfolio_owners where user_id = auth.uid());
$$;
revoke all on function public.is_portfolio_owner() from public, anon;
grant execute on function public.is_portfolio_owner() to authenticated;

create table if not exists public.portfolio_content (
 id text primary key check (id = 'main'),
 data jsonb not null check (jsonb_typeof(data) = 'object' and octet_length(data::text) < 1000000),
 version integer not null default 1,
 updated_at timestamptz not null default now()
);
alter table public.portfolio_content enable row level security;
revoke all on public.portfolio_content from anon, authenticated;
grant select on public.portfolio_content to anon, authenticated;
drop policy if exists "Public portfolio read" on public.portfolio_content;
create policy "Public portfolio read" on public.portfolio_content for select to anon, authenticated using (true);

create or replace function public.publish_portfolio(new_data jsonb, expected_version integer) returns integer
language plpgsql security definer set search_path = '' as $$
declare current_version integer;
begin
 if not public.is_portfolio_owner() then raise exception 'not_authorized'; end if;
 if jsonb_typeof(new_data) is distinct from 'object' or octet_length(new_data::text)>1000000 or
    jsonb_typeof(new_data->'profile') is distinct from 'object' or
    jsonb_typeof(new_data->'projects') is distinct from 'array' or
    jsonb_typeof(new_data->'skills') is distinct from 'array' or
    jsonb_typeof(new_data->'education') is distinct from 'array' or
    jsonb_typeof(new_data->'certificates') is distinct from 'array' or
    jsonb_typeof(new_data->'achievements') is distinct from 'array' or
    jsonb_typeof(new_data->'pages') is distinct from 'array' then raise exception 'invalid_content'; end if;
 perform pg_advisory_xact_lock(75841028);
 select version into current_version from public.portfolio_content where id='main' for update;
 if coalesce(current_version,0) is distinct from expected_version then raise exception 'version_conflict'; end if;
 insert into public.portfolio_content(id,data,version) values ('main',new_data,1)
 on conflict(id) do update set data=excluded.data, version=public.portfolio_content.version+1,updated_at=now()
 returning version into current_version;
 return current_version;
end;
$$;
revoke all on function public.publish_portfolio(jsonb,integer) from public, anon;
grant execute on function public.publish_portfolio(jsonb,integer) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('portfolio-media','portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=true,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Owner upload portfolio media" on storage.objects;
create policy "Owner upload portfolio media" on storage.objects for insert to authenticated
with check (bucket_id='portfolio-media' and public.is_portfolio_owner() and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Owner list portfolio media" on storage.objects;
create policy "Owner list portfolio media" on storage.objects for select to authenticated
using (bucket_id='portfolio-media' and public.is_portfolio_owner());
-- Replacements use new UUID paths. No client update/delete grants: existing links remain valid.
commit;

-- After creating your user via Authentication > Users, run separately with its actual UUID:
-- insert into public.portfolio_owners(user_id) values ('YOUR-AUTH-USER-UUID');
