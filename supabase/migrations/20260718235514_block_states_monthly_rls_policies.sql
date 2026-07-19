CREATE OR REPLACE FUNCTION is_block_owner(p_block_id uuid) RETURNS boolean AS $$
	SELECT EXISTS (
		SELECT 1 FROM blocks
		JOIN tasks ON tasks.id = blocks.task_id
		WHERE blocks.id = p_block_id AND is_task_owner(tasks.id)
	);
$$ LANGUAGE sql STABLE SECURITY INVOKER;

ALTER TABLE block_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own block states" ON block_states
	FOR SELECT TO authenticated USING (is_block_owner(block_id));

CREATE POLICY "Users can insert own block states" ON block_states
	FOR INSERT TO authenticated WITH CHECK (is_block_owner(block_id));

CREATE POLICY "Users can update own block states" ON block_states
	FOR UPDATE TO authenticated USING (is_block_owner(block_id)) WITH CHECK (is_block_owner(block_id));

CREATE POLICY "Users can delete own block states" ON block_states
	FOR DELETE TO authenticated USING (is_block_owner(block_id));
