ALTER TABLE states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own task states" ON states
	FOR SELECT
	TO authenticated
	USING (is_task_owner(task_id));

CREATE POLICY "Users can insert own task states" ON states
	FOR INSERT
	TO authenticated
	WITH CHECK (is_task_owner(task_id));

CREATE POLICY "Users can update own task states" ON states
	FOR UPDATE
	TO authenticated
	USING (is_task_owner(task_id))
	WITH CHECK (is_task_owner(task_id));

CREATE POLICY "Users can delete own task states" ON states
	FOR DELETE
	TO authenticated
	USING (is_task_owner(task_id));
