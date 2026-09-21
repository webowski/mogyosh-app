-- Drop old schedules table (row-per-rule design)
DROP TABLE IF EXISTS public.schedules CASCADE;

-- New schedules: one rule payload per task, encoded via codec
CREATE TABLE public.schedules (
  task_id     uuid PRIMARY KEY REFERENCES public.tasks(id) ON DELETE CASCADE,
  encoding    smallint NOT NULL DEFAULT 1,
  payload     bytea NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX schedules_task_id_idx ON public.schedules (task_id);

-- RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules"
  ON public.schedules
  FOR SELECT
  USING (public.is_task_owner(task_id));

CREATE POLICY "Users can insert own schedules"
  ON public.schedules
  FOR INSERT
  WITH CHECK (public.is_task_owner(task_id));

CREATE POLICY "Users can update own schedules"
  ON public.schedules
  FOR UPDATE
  USING (public.is_task_owner(task_id))
  WITH CHECK (public.is_task_owner(task_id));

CREATE POLICY "Users can delete own schedules"
  ON public.schedules
  FOR DELETE
  USING (public.is_task_owner(task_id));
