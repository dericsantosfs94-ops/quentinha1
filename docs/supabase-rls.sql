-- Execute no SQL Editor do Supabase depois de criar as tabelas.
-- O projeto usa auth.uid() = users.open_id para vincular Auth ao perfil administrativo.

alter table public.users enable row level security;
alter table public.menu_categories enable row level security;
alter table public.menu_products enable row level security;
alter table public.menu_product_options enable row level security;
alter table public.restaurant_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where open_id = auth.uid()::text and role = 'admin'
  );
$$;

-- Perfil: usuário autenticado pode consultar e criar somente o próprio registro.
drop policy if exists users_select_own on public.users;
create policy users_select_own on public.users for select to authenticated using (open_id = auth.uid()::text or public.is_admin());

drop policy if exists users_insert_own on public.users;
create policy users_insert_own on public.users for insert to authenticated with check (open_id = auth.uid()::text);

drop policy if exists users_update_own on public.users;
create policy users_update_own on public.users for update to authenticated using (open_id = auth.uid()::text or public.is_admin()) with check (open_id = auth.uid()::text or public.is_admin());

-- O cardápio público lê apenas registros ativos/disponíveis.
drop policy if exists categories_public_select on public.menu_categories;
create policy categories_public_select on public.menu_categories for select to anon, authenticated using (active = true or public.is_admin());

drop policy if exists products_public_select on public.menu_products;
create policy products_public_select on public.menu_products for select to anon, authenticated using (available = true or public.is_admin());

drop policy if exists options_public_select on public.menu_product_options;
create policy options_public_select on public.menu_product_options for select to anon, authenticated using (available = true or public.is_admin());

drop policy if exists settings_public_select on public.restaurant_settings;
create policy settings_public_select on public.restaurant_settings for select to anon, authenticated using (true);

-- Admin pode criar, editar e remover o catálogo/status.
drop policy if exists categories_admin_all on public.menu_categories;
create policy categories_admin_all on public.menu_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists products_admin_all on public.menu_products;
create policy products_admin_all on public.menu_products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists options_admin_all on public.menu_product_options;
create policy options_admin_all on public.menu_product_options for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists settings_admin_all on public.restaurant_settings;
create policy settings_admin_all on public.restaurant_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage: crie o bucket público menu-products uma única vez.
insert into storage.buckets (id, name, public)
values ('menu-products', 'menu-products', true)
on conflict (id) do update set public = true;

drop policy if exists menu_products_public_read on storage.objects;
create policy menu_products_public_read on storage.objects for select to public using (bucket_id = 'menu-products');

drop policy if exists menu_products_admin_insert on storage.objects;
create policy menu_products_admin_insert on storage.objects for insert to authenticated with check (bucket_id = 'menu-products' and public.is_admin());

drop policy if exists menu_products_admin_update on storage.objects;
create policy menu_products_admin_update on storage.objects for update to authenticated using (bucket_id = 'menu-products' and public.is_admin()) with check (bucket_id = 'menu-products' and public.is_admin());

drop policy if exists menu_products_admin_delete on storage.objects;
create policy menu_products_admin_delete on storage.objects for delete to authenticated using (bucket_id = 'menu-products' and public.is_admin());
