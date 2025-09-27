# Supabase setup for profile status

Use this SQL in Supabase SQL editor.

## 1) Table
```sql
create table if not exists public.profile_status (
  id bigint primary key default 1 check (id = 1),
  status text not null check (status in ('online','away','offline')) default 'online',
  updated_at timestamptz not null default now()
);

-- Ensure single row exists
insert into public.profile_status (id)
values (1)
on conflict (id) do nothing;
```

## 2) RLS
```sql
alter table public.profile_status enable row level security;

-- Everyone can read the single row
create policy profile_status_select
on public.profile_status
for select
using (true);

-- Only authenticated admin can update
-- Replace the email below with your admin email
create policy profile_status_update
on public.profile_status
for update
using (auth.role() = 'authenticated' and auth.email() = 'your-admin@email.com')
with check (auth.role() = 'authenticated' and auth.email() = 'your-admin@email.com');
```

Tip: You can also create a dedicated `admins` table and check membership in policy if you prefer.

## 3) Auth
- Create an Auth user with the admin email above.
- In Project Settings → API: copy `Project URL` and `anon public` key.

## 4) Client usage
- Copy `supabase-config.example.js` to `supabase-config.js` and fill in URL + anon key.
- Add this script before any code that uses Supabase:
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="supabase-config.js"></script>
```

Admin page will sign in with email/password and update the single-row table.
Homepage will read the row without authentication.
