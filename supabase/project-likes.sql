create table if not exists public.project_likes (
  project_id text not null,
  browser_digest text not null,
  primary key (project_id, browser_digest)
);
alter table public.project_likes enable row level security;
revoke all on public.project_likes from public, anon, authenticated;

create or replace function public.project_like_state(slug text, digest text, desired boolean)
returns jsonb language plpgsql security definer set search_path = '' as $$
begin
  if slug is null or length(slug) not between 1 and 100 or digest is null or digest !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid like';
  end if;
  if desired is not null then
    perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(slug));
    if desired then
      insert into public.project_likes values (slug, digest) on conflict do nothing;
    else
      delete from public.project_likes where project_id = slug and browser_digest = digest;
    end if;
  end if;
  return (select jsonb_build_object('count', count(*), 'liked', coalesce(bool_or(browser_digest = digest), false))
          from public.project_likes where project_id = slug);
end $$;
revoke all on function public.project_like_state(text,text,boolean) from public, anon, authenticated;
grant execute on function public.project_like_state(text,text,boolean) to service_role;
