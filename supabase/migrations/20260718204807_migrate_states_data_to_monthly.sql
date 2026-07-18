DO $$
DECLARE
	row_record RECORD;
	day_of_month integer;
	byte_index integer;
	bit_index integer;
BEGIN
	FOR row_record IN
		SELECT task_id, date_trunc('month', created_at)::date AS month, created_at, completed
		FROM states
		WHERE completed = true
	LOOP
		INSERT INTO states_monthly (task_id, month, completed)
		VALUES (row_record.task_id, row_record.month, '\x00000000'::bytea)
		ON CONFLICT (task_id, month) DO NOTHING;

		day_of_month := EXTRACT(DAY FROM row_record.created_at)::integer;
		byte_index := (day_of_month - 1) / 8;
		bit_index := (day_of_month - 1) % 8;

		UPDATE states_monthly
		SET completed = set_byte(
				completed,
				byte_index,
				get_byte(completed, byte_index) | (1 << bit_index)
			)
		WHERE task_id = row_record.task_id AND month = row_record.month;
	END LOOP;
END $$;
