


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_or_create_motivation_task"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
declare
  v_task_id uuid;
begin
  select id into v_task_id from tasks
  where user_id = auth.uid() and type = 'motivation' limit 1;

  if v_task_id is null then
    insert into tasks (user_id, type)
    values (auth.uid(), 'motivation')
    on conflict (user_id) where (type = 'motivation') do nothing
    returning id into v_task_id;
  end if;

  if v_task_id is null then
    select id into v_task_id from tasks
    where user_id = auth.uid() and type = 'motivation' limit 1;
  end if;

  return v_task_id;
end;
$$;


ALTER FUNCTION "public"."get_or_create_motivation_task"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_task_owner"("task_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  select exists (
    select 1
    from public.tasks
    where id = task_id
      and user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_task_owner"("task_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."block_states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "block_id" "uuid" NOT NULL,
    "state" "text" NOT NULL,
    "state_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "settings" "jsonb"
);


ALTER TABLE "public"."block_states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."blocks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "type" "text",
    "text_content" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "settings" "jsonb",
    "sort_order" "text" COLLATE "pg_catalog"."C"
);


ALTER TABLE "public"."blocks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "parent_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone,
    "username" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."schedules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "start_time" time without time zone,
    "end_time" time without time zone,
    "date" "date",
    "weekday" integer,
    "month_day" integer,
    "month" integer,
    "start_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."schedules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."states" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid" NOT NULL,
    "state" "text" NOT NULL,
    "state_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."states" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "parent_id" "uuid",
    "category_id" "uuid",
    "title" "text",
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "priority" integer,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'task'::"text" NOT NULL,
    CONSTRAINT "check_tasks_info_not_empty" CHECK ((("title" IS NULL) OR ("length"(TRIM(BOTH FROM "title")) > 0)))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


ALTER TABLE ONLY "public"."block_states"
    ADD CONSTRAINT "block_states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



CREATE INDEX "block_states_block_id_idx" ON "public"."block_states" USING "btree" ("block_id");



CREATE INDEX "blocks_parent_id_idx" ON "public"."blocks" USING "btree" ("parent_id");



CREATE INDEX "blocks_sort_order_idx" ON "public"."blocks" USING "btree" ("task_id", "sort_order");



CREATE INDEX "idx_categories_parent_id" ON "public"."categories" USING "btree" ("parent_id");



CREATE INDEX "idx_categories_user_id" ON "public"."categories" USING "btree" ("user_id");



CREATE INDEX "idx_schedules_date" ON "public"."schedules" USING "btree" ("date");



CREATE INDEX "idx_schedules_date_range" ON "public"."schedules" USING "btree" ("start_date", "end_date");



CREATE INDEX "idx_schedules_month" ON "public"."schedules" USING "btree" ("month");



CREATE INDEX "idx_schedules_month_day" ON "public"."schedules" USING "btree" ("month_day");



CREATE INDEX "idx_schedules_task_id" ON "public"."schedules" USING "btree" ("task_id");



CREATE INDEX "idx_schedules_weekday" ON "public"."schedules" USING "btree" ("weekday");



CREATE INDEX "idx_tasks_category_id" ON "public"."tasks" USING "btree" ("category_id");



CREATE INDEX "idx_tasks_id_user_id" ON "public"."tasks" USING "btree" ("id", "user_id");



CREATE INDEX "idx_tasks_parent_id" ON "public"."tasks" USING "btree" ("parent_id");



CREATE INDEX "idx_tasks_user_id" ON "public"."tasks" USING "btree" ("user_id");



CREATE UNIQUE INDEX "tasks_one_motivation_per_user" ON "public"."tasks" USING "btree" ("user_id") WHERE ("type" = 'motivation'::"text");



CREATE UNIQUE INDEX "uniq_category_name_per_user_parent" ON "public"."categories" USING "btree" ("user_id", "parent_id", "name");



CREATE OR REPLACE TRIGGER "update_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."block_states"
    ADD CONSTRAINT "block_states_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "public"."blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."blocks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."blocks"
    ADD CONSTRAINT "blocks_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."schedules"
    ADD CONSTRAINT "schedules_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."states"
    ADD CONSTRAINT "states_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Individuals can create tasks." ON "public"."tasks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Individuals can delete their own tasks." ON "public"."tasks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Individuals can update their own tasks." ON "public"."tasks" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Individuals can view their own tasks." ON "public"."tasks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Users can access their schedules" ON "public"."schedules" USING ("public"."is_task_owner"("task_id")) WITH CHECK ("public"."is_task_owner"("task_id"));



CREATE POLICY "Users can create categories" ON "public"."categories" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can delete own block_states" ON "public"."block_states" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."blocks"
     JOIN "public"."tasks" ON (("tasks"."id" = "blocks"."task_id")))
  WHERE (("blocks"."id" = "block_states"."block_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own blocks" ON "public"."blocks" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "blocks"."task_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own task states" ON "public"."states" FOR DELETE TO "authenticated" USING ("public"."is_task_owner"("task_id"));



CREATE POLICY "Users can delete their categories" ON "public"."categories" FOR DELETE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can insert own block_states" ON "public"."block_states" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."blocks"
     JOIN "public"."tasks" ON (("tasks"."id" = "blocks"."task_id")))
  WHERE (("blocks"."id" = "block_states"."block_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own blocks" ON "public"."blocks" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "blocks"."task_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert own task states" ON "public"."states" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_task_owner"("task_id"));



CREATE POLICY "Users can insert their own profile." ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own block_states" ON "public"."block_states" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."blocks"
     JOIN "public"."tasks" ON (("tasks"."id" = "blocks"."task_id")))
  WHERE (("blocks"."id" = "block_states"."block_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own blocks" ON "public"."blocks" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "blocks"."task_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own profile." ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "Users can update own task states" ON "public"."states" FOR UPDATE TO "authenticated" USING ("public"."is_task_owner"("task_id")) WITH CHECK ("public"."is_task_owner"("task_id"));



CREATE POLICY "Users can update their categories" ON "public"."categories" FOR UPDATE USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own block_states" ON "public"."block_states" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."blocks"
     JOIN "public"."tasks" ON (("tasks"."id" = "blocks"."task_id")))
  WHERE (("blocks"."id" = "block_states"."block_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own blocks" ON "public"."blocks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."tasks"
  WHERE (("tasks"."id" = "blocks"."task_id") AND ("tasks"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own task states" ON "public"."states" FOR SELECT TO "authenticated" USING ("public"."is_task_owner"("task_id"));



CREATE POLICY "Users can view their categories" ON "public"."categories" FOR SELECT USING (("user_id" = "auth"."uid"()));



ALTER TABLE "public"."block_states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."blocks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."schedules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."states" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_or_create_motivation_task"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_or_create_motivation_task"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_or_create_motivation_task"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_task_owner"("task_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_task_owner"("task_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_task_owner"("task_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."block_states" TO "anon";
GRANT ALL ON TABLE "public"."block_states" TO "authenticated";
GRANT ALL ON TABLE "public"."block_states" TO "service_role";



GRANT ALL ON TABLE "public"."blocks" TO "anon";
GRANT ALL ON TABLE "public"."blocks" TO "authenticated";
GRANT ALL ON TABLE "public"."blocks" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."schedules" TO "anon";
GRANT ALL ON TABLE "public"."schedules" TO "authenticated";
GRANT ALL ON TABLE "public"."schedules" TO "service_role";



GRANT ALL ON TABLE "public"."states" TO "anon";
GRANT ALL ON TABLE "public"."states" TO "authenticated";
GRANT ALL ON TABLE "public"."states" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";



































