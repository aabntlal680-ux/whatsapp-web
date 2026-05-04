-- ============================================================
-- WhatsApp Business Dashboard — Supabase Schema
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rixxshbiyahqogaythej/sql/new
-- ============================================================

-- 1. contacts
create table if not exists public.contacts (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  phone           text not null unique,
  is_online       boolean not null default false,
  last_message_at timestamptz,
  last_message_preview text,
  unread_count    int not null default 0,
  avatar_url      text,
  created_at      timestamptz not null default now()
);

-- 2. account_status  (fix: add updated_at if missing)
create table if not exists public.account_status (
  id         uuid primary key default gen_random_uuid(),
  status     text not null check (status in ('GREEN','YELLOW','RED')),
  reason     text,
  updated_at timestamptz not null default now()
);

-- Add updated_at if the table already exists without it
alter table public.account_status
  add column if not exists updated_at timestamptz not null default now();

-- Seed an initial GREEN row if table is empty
insert into public.account_status (status, reason)
select 'GREEN', 'Initial setup'
where not exists (select 1 from public.account_status);

-- 3. messages
create table if not exists public.messages (
  id            uuid primary key default gen_random_uuid(),
  contact_id    uuid not null references public.contacts(id) on delete cascade,
  content       text not null,
  direction     text not null check (direction in ('incoming','outgoing')),
  type          text not null default 'text' check (type in ('text','template')),
  status        text default 'sent' check (status in ('sent','delivered','read')),
  template_name text,
  created_at    timestamptz not null default now()
);

-- 4. templates  (fix: create if missing)
create table if not exists public.templates (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  content  text not null,
  language text default 'ar',
  category text default 'UTILITY',
  created_at timestamptz not null default now()
);

-- Seed default Arabic templates if table is empty
insert into public.templates (name, content, language, category)
select * from (values
  ('ترحيب',        'مرحباً، كيف يمكننا مساعدتك اليوم؟',                      'ar', 'UTILITY'),
  ('متابعة طلب',   'شكراً لتواصلك معنا. سنعود إليك في أقرب وقت ممكن.',       'ar', 'UTILITY'),
  ('تأكيد موعد',   'تم تأكيد موعدك. نتطلع إلى خدمتك.',                       'ar', 'UTILITY'),
  ('إشعار شحن',    'طلبك في الطريق إليك! سيصل خلال 2-3 أيام عمل.',           'ar', 'UTILITY')
) as t(name, content, language, category)
where not exists (select 1 from public.templates);

-- ============================================================
-- Enable Realtime for all three tables
-- ============================================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.account_status;
alter publication supabase_realtime add table public.contacts;

-- ============================================================
-- Row Level Security (open read/write for anon — tighten in prod)
-- ============================================================
alter table public.contacts       enable row level security;
alter table public.account_status enable row level security;
alter table public.messages       enable row level security;
alter table public.templates      enable row level security;

create policy if not exists "anon_all" on public.contacts       for all using (true) with check (true);
create policy if not exists "anon_all" on public.account_status for all using (true) with check (true);
create policy if not exists "anon_all" on public.messages       for all using (true) with check (true);
create policy if not exists "anon_all" on public.templates      for all to anon using (true);
