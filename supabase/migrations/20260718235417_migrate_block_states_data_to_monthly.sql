ALTER TABLE block_states_monthly
	ALTER COLUMN state SET DEFAULT decode('01' || repeat('0000', 31), 'hex');

DO $$
DECLARE
	row_record RECORD;
	target_month date;
	day_of_month integer;
	day_payload bytea;
	current_state bytea;
	day_index integer;
	byte_offset integer;
	target_offset integer;
	target_length integer;
	before_bytes bytea;
	after_bytes bytea;
	new_offsets bytea;
	new_length integer;
	loop_day integer;
	loop_len integer;
BEGIN
	FOR row_record IN
		SELECT block_id, state_date, state
		FROM block_states
		WHERE state_date IS NOT NULL
		ORDER BY block_id, state_date
	LOOP
		target_month := date_trunc('month', row_record.state_date)::date;
		day_of_month := EXTRACT(DAY FROM row_record.state_date)::integer;
		day_index := day_of_month - 1;

		-- codec v1 checkbox: msgpack true = 0xC3, false = 0xC2, prefixed with codec version byte 0x01
		day_payload := CASE
			WHEN row_record.state = 'done' THEN '\x01c3'::bytea
			ELSE '\x01c2'::bytea
		END;
		new_length := length(day_payload);

		INSERT INTO block_states_monthly (block_id, month)
		VALUES (row_record.block_id, target_month)
		ON CONFLICT (block_id, month) DO NOTHING;

		SELECT state INTO current_state
		FROM block_states_monthly
		WHERE block_id = row_record.block_id AND month = target_month;

		byte_offset := 63; -- 1 header + 62 offsets table
		FOR loop_day IN 0..(day_index - 1) LOOP
			loop_len := get_byte(current_state, 1 + loop_day * 2)
				+ (get_byte(current_state, 1 + loop_day * 2 + 1) << 8);
			byte_offset := byte_offset + loop_len;
		END LOOP;

		target_length := get_byte(current_state, 1 + day_index * 2)
			+ (get_byte(current_state, 1 + day_index * 2 + 1) << 8);

		before_bytes := substring(current_state FROM 64 FOR (byte_offset - 63));
		after_bytes := substring(current_state FROM byte_offset + target_length + 1);

		new_offsets := substring(current_state FROM 2 FOR 62);
		new_offsets := set_byte(new_offsets, day_index * 2, new_length & 255);
		new_offsets := set_byte(new_offsets, day_index * 2 + 1, (new_length >> 8) & 255);

		current_state := set_byte('\x00'::bytea, 0, 1) || new_offsets || before_bytes || day_payload || after_bytes;

		UPDATE block_states_monthly
		SET state = current_state, updated_at = now()
		WHERE block_id = row_record.block_id AND month = target_month;
	END LOOP;
END $$;
