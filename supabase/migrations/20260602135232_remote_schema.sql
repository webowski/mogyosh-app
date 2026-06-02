
  create table "public"."motivation_subitems" (
    "id" uuid not null default gen_random_uuid(),
    "parent_id" uuid,
    "user_id" uuid not null,
    "info" text,
    "type" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."motivation_subitems" enable row level security;


  create table "public"."subitem_states" (
    "id" uuid not null default gen_random_uuid(),
    "subitem_id" uuid not null,
    "state" text not null,
    "state_date" date,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."subitem_states" enable row level security;


  create table "public"."subitems" (
    "id" uuid not null default gen_random_uuid(),
    "task_id" uuid not null,
    "parent_id" uuid,
    "type" text,
    "info" text,
    "status" text not null default 'active'::text,
    "sort_order" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone default now(),
    "settings" jsonb
      );


alter table "public"."subitems" enable row level security;

CREATE UNIQUE INDEX motivation_subitems_pkey ON public.motivation_subitems USING btree (id);

CREATE UNIQUE INDEX subitem_states_pkey ON public.subitem_states USING btree (id);

CREATE INDEX subitem_states_subitem_id_idx ON public.subitem_states USING btree (subitem_id);

CREATE INDEX subitems_parent_id_idx ON public.subitems USING btree (parent_id);

CREATE UNIQUE INDEX subitems_pkey ON public.subitems USING btree (id);

CREATE INDEX subitems_task_id_sort_order_idx ON public.subitems USING btree (task_id, sort_order);

alter table "public"."motivation_subitems" add constraint "motivation_subitems_pkey" PRIMARY KEY using index "motivation_subitems_pkey";

alter table "public"."subitem_states" add constraint "subitem_states_pkey" PRIMARY KEY using index "subitem_states_pkey";

alter table "public"."subitems" add constraint "subitems_pkey" PRIMARY KEY using index "subitems_pkey";

alter table "public"."motivation_subitems" add constraint "motivation_subitems_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.motivation_subitems(id) ON DELETE CASCADE not valid;

alter table "public"."motivation_subitems" validate constraint "motivation_subitems_parent_id_fkey";

alter table "public"."motivation_subitems" add constraint "motivation_subitems_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."motivation_subitems" validate constraint "motivation_subitems_user_id_fkey";

alter table "public"."subitem_states" add constraint "subitem_states_subitem_id_fkey" FOREIGN KEY (subitem_id) REFERENCES public.subitems(id) ON DELETE CASCADE not valid;

alter table "public"."subitem_states" validate constraint "subitem_states_subitem_id_fkey";

alter table "public"."subitems" add constraint "subitems_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.subitems(id) ON DELETE CASCADE not valid;

alter table "public"."subitems" validate constraint "subitems_parent_id_fkey";

alter table "public"."subitems" add constraint "subitems_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."subitems" validate constraint "subitems_task_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_task_owner(task_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.tasks
    where id = task_id
      and user_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$
;

grant delete on table "public"."motivation_subitems" to "anon";

grant insert on table "public"."motivation_subitems" to "anon";

grant references on table "public"."motivation_subitems" to "anon";

grant select on table "public"."motivation_subitems" to "anon";

grant trigger on table "public"."motivation_subitems" to "anon";

grant truncate on table "public"."motivation_subitems" to "anon";

grant update on table "public"."motivation_subitems" to "anon";

grant delete on table "public"."motivation_subitems" to "authenticated";

grant insert on table "public"."motivation_subitems" to "authenticated";

grant references on table "public"."motivation_subitems" to "authenticated";

grant select on table "public"."motivation_subitems" to "authenticated";

grant trigger on table "public"."motivation_subitems" to "authenticated";

grant truncate on table "public"."motivation_subitems" to "authenticated";

grant update on table "public"."motivation_subitems" to "authenticated";

grant delete on table "public"."motivation_subitems" to "service_role";

grant insert on table "public"."motivation_subitems" to "service_role";

grant references on table "public"."motivation_subitems" to "service_role";

grant select on table "public"."motivation_subitems" to "service_role";

grant trigger on table "public"."motivation_subitems" to "service_role";

grant truncate on table "public"."motivation_subitems" to "service_role";

grant update on table "public"."motivation_subitems" to "service_role";

grant delete on table "public"."subitem_states" to "anon";

grant insert on table "public"."subitem_states" to "anon";

grant references on table "public"."subitem_states" to "anon";

grant select on table "public"."subitem_states" to "anon";

grant trigger on table "public"."subitem_states" to "anon";

grant truncate on table "public"."subitem_states" to "anon";

grant update on table "public"."subitem_states" to "anon";

grant delete on table "public"."subitem_states" to "authenticated";

grant insert on table "public"."subitem_states" to "authenticated";

grant references on table "public"."subitem_states" to "authenticated";

grant select on table "public"."subitem_states" to "authenticated";

grant trigger on table "public"."subitem_states" to "authenticated";

grant truncate on table "public"."subitem_states" to "authenticated";

grant update on table "public"."subitem_states" to "authenticated";

grant delete on table "public"."subitem_states" to "service_role";

grant insert on table "public"."subitem_states" to "service_role";

grant references on table "public"."subitem_states" to "service_role";

grant select on table "public"."subitem_states" to "service_role";

grant trigger on table "public"."subitem_states" to "service_role";

grant truncate on table "public"."subitem_states" to "service_role";

grant update on table "public"."subitem_states" to "service_role";

grant delete on table "public"."subitems" to "anon";

grant insert on table "public"."subitems" to "anon";

grant references on table "public"."subitems" to "anon";

grant select on table "public"."subitems" to "anon";

grant trigger on table "public"."subitems" to "anon";

grant truncate on table "public"."subitems" to "anon";

grant update on table "public"."subitems" to "anon";

grant delete on table "public"."subitems" to "authenticated";

grant insert on table "public"."subitems" to "authenticated";

grant references on table "public"."subitems" to "authenticated";

grant select on table "public"."subitems" to "authenticated";

grant trigger on table "public"."subitems" to "authenticated";

grant truncate on table "public"."subitems" to "authenticated";

grant update on table "public"."subitems" to "authenticated";

grant delete on table "public"."subitems" to "service_role";

grant insert on table "public"."subitems" to "service_role";

grant references on table "public"."subitems" to "service_role";

grant select on table "public"."subitems" to "service_role";

grant trigger on table "public"."subitems" to "service_role";

grant truncate on table "public"."subitems" to "service_role";

grant update on table "public"."subitems" to "service_role";


  create policy "Users can delete own motivation_subitems"
  on "public"."motivation_subitems"
  as permissive
  for delete
  to public
using ((auth.uid() = user_id));



  create policy "Users can insert own motivation_subitems"
  on "public"."motivation_subitems"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can update own motivation_subitems"
  on "public"."motivation_subitems"
  as permissive
  for update
  to public
using ((auth.uid() = user_id));



  create policy "Users can view own motivation_subitems"
  on "public"."motivation_subitems"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can delete own subitem_states"
  on "public"."subitem_states"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM (public.subitems
     JOIN public.tasks ON ((tasks.id = subitems.task_id)))
  WHERE ((subitems.id = subitem_states.subitem_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can insert own subitem_states"
  on "public"."subitem_states"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM (public.subitems
     JOIN public.tasks ON ((tasks.id = subitems.task_id)))
  WHERE ((subitems.id = subitem_states.subitem_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can update own subitem_states"
  on "public"."subitem_states"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM (public.subitems
     JOIN public.tasks ON ((tasks.id = subitems.task_id)))
  WHERE ((subitems.id = subitem_states.subitem_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can view own subitem_states"
  on "public"."subitem_states"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM (public.subitems
     JOIN public.tasks ON ((tasks.id = subitems.task_id)))
  WHERE ((subitems.id = subitem_states.subitem_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can delete own subitems"
  on "public"."subitems"
  as permissive
  for delete
  to public
using ((EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = subitems.task_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can insert own subitems"
  on "public"."subitems"
  as permissive
  for insert
  to public
with check ((EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = subitems.task_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can update own subitems"
  on "public"."subitems"
  as permissive
  for update
  to public
using ((EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = subitems.task_id) AND (tasks.user_id = auth.uid())))));



  create policy "Users can view own subitems"
  on "public"."subitems"
  as permissive
  for select
  to public
using ((EXISTS ( SELECT 1
   FROM public.tasks
  WHERE ((tasks.id = subitems.task_id) AND (tasks.user_id = auth.uid())))));



