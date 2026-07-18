CREATE OR REPLACE FUNCTION set_task_day_completed(
	p_task_id uuid,
	p_month date,
	p_day_of_month integer,
	p_completed boolean
) RETURNS bytea AS $$
DECLARE
	v_byte_index integer := (p_day_of_month - 1) / 8;
	v_bit_index integer := (p_day_of_month - 1) % 8;
	v_result bytea;
BEGIN
	INSERT INTO states (task_id, month, completed)
	VALUES (p_task_id, p_month, '\x00000000'::bytea)
	ON CONFLICT (task_id, month) DO NOTHING;

	UPDATE states
	SET completed = CASE
			WHEN p_completed THEN set_byte(completed, v_byte_index, get_byte(completed, v_byte_index) | (1 << v_bit_index))
			ELSE set_byte(completed, v_byte_index, get_byte(completed, v_byte_index) & ~(1 << v_bit_index))
		END,
		updated_at = now()
	WHERE task_id = p_task_id AND month = p_month
	RETURNING completed INTO v_result;

	RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
