
  create table "public"."states" (
    "id" uuid not null default gen_random_uuid(),
    "task_id" uuid not null,
    "state" text not null,
    "state_date" date,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."states" enable row level security;

CREATE UNIQUE INDEX states_pkey ON public.states USING btree (id);

alter table "public"."states" add constraint "states_pkey" PRIMARY KEY using index "states_pkey";

alter table "public"."states" add constraint "states_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."states" validate constraint "states_task_id_fkey";

set check_function_bodies = off;

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

grant delete on table "public"."states" to "anon";

grant insert on table "public"."states" to "anon";

grant references on table "public"."states" to "anon";

grant select on table "public"."states" to "anon";

grant trigger on table "public"."states" to "anon";

grant truncate on table "public"."states" to "anon";

grant update on table "public"."states" to "anon";

grant delete on table "public"."states" to "authenticated";

grant insert on table "public"."states" to "authenticated";

grant references on table "public"."states" to "authenticated";

grant select on table "public"."states" to "authenticated";

grant trigger on table "public"."states" to "authenticated";

grant truncate on table "public"."states" to "authenticated";

grant update on table "public"."states" to "authenticated";

grant delete on table "public"."states" to "service_role";

grant insert on table "public"."states" to "service_role";

grant references on table "public"."states" to "service_role";

grant select on table "public"."states" to "service_role";

grant trigger on table "public"."states" to "service_role";

grant truncate on table "public"."states" to "service_role";

grant update on table "public"."states" to "service_role";


  create policy "Users can delete own task states"
  on "public"."states"
  as permissive
  for delete
  to authenticated
using (public.is_task_owner(task_id));



  create policy "Users can insert own task states"
  on "public"."states"
  as permissive
  for insert
  to authenticated
with check (public.is_task_owner(task_id));



  create policy "Users can update own task states"
  on "public"."states"
  as permissive
  for update
  to authenticated
using (public.is_task_owner(task_id))
with check (public.is_task_owner(task_id));



  create policy "Users can view own task states"
  on "public"."states"
  as permissive
  for select
  to authenticated
using (public.is_task_owner(task_id));



