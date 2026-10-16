-- BATALHA MUNDURUKU VS MUIRAPINIMA V1.1
-- Execute UMA VEZ no Supabase > SQL Editor > New query > Run.
-- Requer: Authentication > Providers > Anonymous Sign-ins = ON.
-- Atenção: esta é uma implementação MVP para adultos, sem verificação robusta da idade.

create table if not exists public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname varchar(24) not null check(char_length(trim(nickname)) between 2 and 24),
 tribe text not null check(tribe in ('munduruku','muirapinima')),
 team_name varchar(26) not null default 'Equipe da Tribo',
 created_at timestamptz not null default now()
);
create table if not exists public.battle_rooms (
 id uuid primary key default gen_random_uuid(),
 code char(6) not null unique,
 mode text not null check(mode in ('festival','duel')),
 arena text not null check(arena in ('munduruku','muirapinima')),
 host_id uuid not null references auth.users(id),
 guest_id uuid references auth.users(id),
 host_alias varchar(24) not null,
 guest_alias varchar(24),
 host_team varchar(26) not null,
 guest_team varchar(26),
 host_tribe text not null check(host_tribe in ('munduruku','muirapinima')),
 guest_tribe text check(guest_tribe in ('munduruku','muirapinima')),
 status text not null default 'waiting' check(status in ('waiting','live','finished','cancelled')),
 host_score integer not null default 0,
 guest_score integer not null default 0,
 host_hp integer not null default 300,
 guest_hp integer not null default 300,
 host_energy integer not null default 0,
 guest_energy integer not null default 0,
 host_last_action timestamptz,
 guest_last_action timestamptz,
 host_last_beat integer not null default -1,
 guest_last_beat integer not null default -1,
 host_guard_until timestamptz,
 guest_guard_until timestamptz,
 started_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists battle_rooms_host_idx on public.battle_rooms(host_id);
create index if not exists battle_rooms_guest_idx on public.battle_rooms(guest_id);
create index if not exists battle_rooms_created_idx on public.battle_rooms(created_at);

alter table public.profiles enable row level security;
alter table public.battle_rooms enable row level security;
revoke all on public.profiles from anon,authenticated;
revoke all on public.battle_rooms from anon,authenticated;
grant select,insert,update,delete on public.profiles to authenticated;
-- Battle rooms have NO direct access: only definer RPCs can read/write.
create policy "owner read" on public.profiles for select to authenticated using (user_id=(select auth.uid()));
create policy "owner insert" on public.profiles for insert to authenticated with check (user_id=(select auth.uid()));
create policy "owner edit" on public.profiles for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
create policy "owner delete" on public.profiles for delete to authenticated using (user_id=(select auth.uid()));

-- Count identities with a saved profile, not people verified and not online presence.
create or replace function public.tribe_counts() returns jsonb
language sql stable security definer set search_path=public,pg_temp as $$
 select jsonb_build_object(
  'munduruku',count(*) filter (where tribe='munduruku'),
  'muirapinima',count(*) filter (where tribe='muirapinima')
 ) from public.profiles;
$$;

create or replace function public.create_battle_room(p_mode text,p_arena text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.profiles%rowtype; new_room uuid; room_code text; attempts int:=0;
begin
 if auth.uid() is null then raise exception 'Faça o login anônimo primeiro.';end if;
 if p_mode not in ('festival','duel') or p_arena not in ('munduruku','muirapinima') then raise exception 'Modalidade ou arena inválida.'; end if;
 select * into p from public.profiles where user_id=auth.uid();
 if not found then raise exception 'Cadastre seu perfil primeiro.'; end if;
 -- Limit pending rooms per account to reduce abuse.
 if (select count(*) from public.battle_rooms where host_id=auth.uid() and status='waiting' and created_at>now()-interval '2 hours')>=2 then
   raise exception 'Você já possui salas pendentes. Encerre uma antes de criar outra.';
 end if;
 loop
  attempts:=attempts+1;
  room_code:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,6));
  begin
   insert into public.battle_rooms(code,mode,arena,host_id,host_alias,host_team,host_tribe)
    values(room_code,p_mode,p_arena,auth.uid(),p.nickname,p.team_name,p.tribe) returning id into new_room;
   exit;
  exception when unique_violation then if attempts>8 then raise;end if;
  end;
 end loop;
 return new_room;
end $$;

create or replace function public.join_battle_room(p_code text) returns uuid
language plpgsql security definer set search_path=public,pg_temp as $$
declare p public.profiles%rowtype;r public.battle_rooms%rowtype;
begin
 if auth.uid() is null then raise exception 'Faça o login anônimo primeiro.';end if;
 select * into p from public.profiles where user_id=auth.uid();
 if not found then raise exception 'Cadastre seu perfil primeiro.';end if;
 select * into r from public.battle_rooms where code=upper(trim(p_code)) for update;
 if not found or r.status<>'waiting' or r.guest_id is not null or r.created_at<now()-interval '2 hours' then
  raise exception 'Sala inexistente, expirada ou ocupada.';
 end if;
 if r.host_id=auth.uid() then raise exception 'Abra a sala em outro aparelho ou conta.';end if;
 if r.host_tribe=p.tribe then raise exception 'Esta sala aguarda jogador da tribo adversária.';end if;
 update public.battle_rooms set guest_id=auth.uid(),guest_alias=p.nickname,guest_team=p.team_name,
    guest_tribe=p.tribe,status='live',started_at=now()+interval '4 seconds' where id=r.id;
 return r.id;
end $$;

create or replace function public.battle_room_state(p_room uuid) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.battle_rooms%rowtype;whose text;
begin
 if auth.uid() is null then return null;end if;
 select * into r from public.battle_rooms where id=p_room for update;
 if not found or (r.host_id<>auth.uid() and r.guest_id is distinct from auth.uid()) then return null;end if;
 if r.status='live' and now()>=r.started_at+interval '60 seconds' then
   update public.battle_rooms set status='finished' where id=p_room returning * into r;
 end if;
 whose:=case when r.host_id=auth.uid() then 'host' else 'guest' end;
 return jsonb_build_object('id',r.id,'code',r.code,'mode',r.mode,'arena',r.arena,'status',r.status,
   'host_alias',r.host_alias,'guest_alias',r.guest_alias,'host_tribe',r.host_tribe,'guest_tribe',r.guest_tribe,
   'host_team',r.host_team,'guest_team',r.guest_team,'host_score',r.host_score,'guest_score',r.guest_score,
   'host_hp',r.host_hp,'guest_hp',r.guest_hp,'host_energy',r.host_energy,'guest_energy',r.guest_energy,
   'started_at',r.started_at,'server_now',now(),'side',whose);
end $$;

create or replace function public.battle_action(p_room uuid,p_action text) returns jsonb
language plpgsql security definer set search_path=public,pg_temp as $$
declare r public.battle_rooms%rowtype; me text;them text;last_at timestamptz;enemy_guard timestamptz;
        idx int;beat_time numeric;offset_time numeric;strength int;damage int;message text:='';
begin
 if auth.uid() is null then raise exception 'Faça o login.';end if;
 select * into r from public.battle_rooms where id=p_room for update;
 if not found or (r.host_id<>auth.uid() and r.guest_id is distinct from auth.uid()) then
  raise exception 'Sem permissão nesta sala.';
 end if;
 if r.status<>'live' then return jsonb_build_object('message','Partida ainda não começou ou terminou.');end if;
 if now()<r.started_at then return jsonb_build_object('message','Começa em instantes!');end if;
 if now()>=r.started_at+interval '60 seconds' then
  update public.battle_rooms set status='finished' where id=r.id;
  return jsonb_build_object('message','Tempo esgotado.');
 end if;
 me:=case when auth.uid()=r.host_id then 'host' else 'guest' end;
 them:=case when me='host' then 'guest' else 'host' end;
 last_at:=case when me='host' then r.host_last_action else r.guest_last_action end;
 enemy_guard:=case when them='host' then r.host_guard_until else r.guest_guard_until end;
 if r.mode='festival' then
  if p_action='beat' then
   beat_time:=extract(epoch from(now()-r.started_at))::numeric;
   idx:=round((beat_time-1.2)/0.82);
   offset_time:=abs(beat_time-(1.2+idx*0.82));
   if idx<0 or idx>73 or offset_time>0.24 then return jsonb_build_object('message','Fora do ritmo!');end if;
   if (me='host' and idx<=r.host_last_beat) or (me='guest' and idx<=r.guest_last_beat) then
    return jsonb_build_object('message','Pulsação já registrada.');
   end if;
   strength:=case when offset_time<0.11 then 120 else 80 end;
   if me='host' then
    update public.battle_rooms set host_score=host_score+strength,host_energy=least(100,host_energy+12),host_last_beat=idx where id=r.id;
   else
    update public.battle_rooms set guest_score=guest_score+strength,guest_energy=least(100,guest_energy+12),guest_last_beat=idx where id=r.id;
   end if;
   message:='Ritmo correto! +'||strength;
  elsif p_action='special' then
   if last_at is not null and now()-last_at<interval '1 second' then return jsonb_build_object('message','Especial em recarga.');end if;
   if (me='host' and r.host_energy<100) or (me='guest' and r.guest_energy<100) then
     return jsonb_build_object('message','Energia insuficiente.');
   end if;
   if me='host' then update public.battle_rooms set host_score=host_score+350,host_energy=0,host_last_action=now() where id=r.id;
   else update public.battle_rooms set guest_score=guest_score+350,guest_energy=0,guest_last_action=now() where id=r.id;end if;
   message:='Especial! +350';
  else raise exception 'Ação inválida no festival.';end if;
 else
  if p_action not in ('strike','guard','special') then raise exception 'Ação de confronto inválida.';end if;
  if last_at is not null and now()-last_at < (case when p_action='special' then interval '1.6 seconds' else interval '0.65 seconds' end) then
   return jsonb_build_object('message','Aguarde sua vez de atacar.');
  end if;
  if p_action='guard' then
   if me='host' then update public.battle_rooms set host_guard_until=now()+interval '1.1 seconds',host_last_action=now() where id=r.id;
   else update public.battle_rooms set guest_guard_until=now()+interval '1.1 seconds',guest_last_action=now() where id=r.id;end if;
   message:='Defesa ativada.';
  else
   if p_action='special' and ((me='host' and r.host_energy<60) or (me='guest' and r.guest_energy<60)) then
    return jsonb_build_object('message','Energia insuficiente para o especial.');
   end if;
   damage:=case when p_action='special' then 27 else 12 end;
   if enemy_guard>now() then damage:=greatest(1,round(damage*0.3)::int);end if;
   if me='host' then
    update public.battle_rooms set guest_hp=greatest(0,guest_hp-damage),host_energy=least(100,greatest(0,host_energy+(case when p_action='special' then -60 else 20 end))),host_last_action=now() where id=r.id;
   else
    update public.battle_rooms set host_hp=greatest(0,host_hp-damage),guest_energy=least(100,greatest(0,guest_energy+(case when p_action='special' then -60 else 20 end))),guest_last_action=now() where id=r.id;
   end if;
   message:=case when p_action='special' then 'Poder da arena: -'||damage||' energia adversária.' else 'Golpe: -'||damage||' energia adversária.' end;
  end if;
  select * into r from public.battle_rooms where id=p_room;
  if r.host_hp=0 or r.guest_hp=0 then update public.battle_rooms set status='finished' where id=r.id;end if;
 end if;
 return jsonb_build_object('message',message);
end $$;

create or replace function public.leave_battle_room(p_room uuid) returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 update public.battle_rooms set status=case when status='waiting' then 'cancelled' else 'finished' end
 where id=p_room and (host_id=auth.uid() or guest_id=auth.uid()) and status in ('waiting','live');
end $$;

-- Elimina pseudônimos, times e salas vinculadas a este cadastro.
-- Identidade anônima do Supabase Auth só pode ser eliminada no painel ou servidor administrativo.
create or replace function public.delete_my_battle_data() returns void
language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if auth.uid() is null then raise exception 'Faça o login.';end if;
 delete from public.battle_rooms where host_id=auth.uid() or guest_id=auth.uid();
 delete from public.profiles where user_id=auth.uid();
end $$;

revoke execute on function public.create_battle_room(text,text) from public,anon;
revoke execute on function public.join_battle_room(text) from public,anon;
revoke execute on function public.battle_room_state(uuid) from public,anon;
revoke execute on function public.battle_action(uuid,text) from public,anon;
revoke execute on function public.leave_battle_room(uuid) from public,anon;
revoke execute on function public.delete_my_battle_data() from public,anon;
grant execute on function public.tribe_counts() to anon,authenticated;
grant execute on function public.create_battle_room(text,text) to authenticated;
grant execute on function public.join_battle_room(text) to authenticated;
grant execute on function public.battle_room_state(uuid) to authenticated;
grant execute on function public.battle_action(uuid,text) to authenticated;
grant execute on function public.leave_battle_room(uuid) to authenticated;
grant execute on function public.delete_my_battle_data() to authenticated;
