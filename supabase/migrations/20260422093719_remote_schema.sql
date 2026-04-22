drop trigger if exists "update_tasks_updated_at" on "public"."tasks";

alter table "public"."categories" drop constraint "categories_parent_id_fkey";

alter table "public"."schedules" drop constraint "schedules_task_id_fkey";

alter table "public"."tasks" drop constraint "tasks_category_id_fkey";

alter table "public"."tasks" drop constraint "tasks_parent_id_fkey";

CREATE INDEX idx_tasks_id_user_id ON public.tasks USING btree (id, user_id);

alter table "public"."categories" add constraint "categories_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.categories(id) ON DELETE CASCADE not valid;

alter table "public"."categories" validate constraint "categories_parent_id_fkey";

alter table "public"."schedules" add constraint "schedules_task_id_fkey" FOREIGN KEY (task_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."schedules" validate constraint "schedules_task_id_fkey";

alter table "public"."tasks" add constraint "tasks_category_id_fkey" FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL not valid;

alter table "public"."tasks" validate constraint "tasks_category_id_fkey";

alter table "public"."tasks" add constraint "tasks_parent_id_fkey" FOREIGN KEY (parent_id) REFERENCES public.tasks(id) ON DELETE CASCADE not valid;

alter table "public"."tasks" validate constraint "tasks_parent_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.is_task_owner(task_id uuid)
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from tasks
    where id = task_id
      and user_id = auth.uid()
  );
$function$
;


  create policy "Users can create categories"
  on "public"."categories"
  as permissive
  for insert
  to public
with check ((user_id = auth.uid()));



  create policy "Users can delete their categories"
  on "public"."categories"
  as permissive
  for delete
  to public
using ((user_id = auth.uid()));



  create policy "Users can update their categories"
  on "public"."categories"
  as permissive
  for update
  to public
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "Users can view their categories"
  on "public"."categories"
  as permissive
  for select
  to public
using ((user_id = auth.uid()));



  create policy "Users can access their schedules"
  on "public"."schedules"
  as permissive
  for all
  to public
using (public.is_task_owner(task_id))
with check (public.is_task_owner(task_id));


CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


