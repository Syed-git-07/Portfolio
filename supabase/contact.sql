-- Run after schema.sql. Only the server's service-role key may reserve a send.
begin;
create table if not exists public.contact_limits (
 bucket text primary key,
 count integer not null,
 expires_at timestamptz not null
);
alter table public.contact_limits enable row level security;
revoke all on public.contact_limits from anon, authenticated;

create or replace function public.reserve_contact_send(ip_digest text) returns boolean
language plpgsql security definer set search_path='' as $$
declare
 now_time timestamptz:=clock_timestamp();
 interval_id text:=floor(extract(epoch from now_time)/900)::text;
 day_id text:=to_char(now_time at time zone 'UTC','YYYY-MM-DD');
 ip_key text; day_key text;
begin
 if ip_digest is null or ip_digest !~ '^[0-9a-f]{64}$' then raise exception 'invalid_digest'; end if;
 ip_key:='ip:'||ip_digest||':'||interval_id;day_key:='day:'||day_id;
 perform pg_advisory_xact_lock(75841029);
 delete from public.contact_limits where expires_at<now_time;
 if coalesce((select count from public.contact_limits where bucket=ip_key),0)>=3
 or coalesce((select count from public.contact_limits where bucket=day_key),0)>=40 then return false;end if;
 insert into public.contact_limits values(ip_key,1,now_time+interval '15 minutes')
 on conflict(bucket) do update set count=public.contact_limits.count+1;
 insert into public.contact_limits values(day_key,1,now_time+interval '1 day')
 on conflict(bucket) do update set count=public.contact_limits.count+1;
 return true;
end;
$$;
revoke all on function public.reserve_contact_send(text) from public,anon,authenticated;
grant execute on function public.reserve_contact_send(text) to service_role;
commit;
