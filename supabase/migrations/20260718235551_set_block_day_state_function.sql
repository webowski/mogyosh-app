CREATE OR REPLACE FUNCTION set_block_day_state(
	p_block_id uuid,
	p_month date,
	p_day_of_month integer,
	p_day_payload bytea
) RETURNS bytea AS $$
DECLARE
	v_state bytea;
	v_day_index integer := p_day_of_month - 1;
	v_new_length integer := length(p_day_payload);
	v_target_offset integer;
	v_target_length integer;
	v_before bytea;
	v_after bytea;
	v_new_offsets bytea;
	v_day integer;
	v_len integer;
BEGIN
	INSERT INTO block_states (block_id, month)
	VALUES (p_block_id, p_month)
	ON CONFLICT (block_id, month) DO NOTHING;

	SELECT state INTO v_state
	FROM block_states
	WHERE block_id = p_block_id AND month = p_month
	FOR UPDATE;

	v_target_offset := 63;
	FOR v_day IN 0..(v_day_index - 1) LOOP
		v_len := get_byte(v_state, 1 + v_day * 2) + (get_byte(v_state, 1 + v_day * 2 + 1) << 8);
		v_target_offset := v_target_offset + v_len;
	END LOOP;

	v_target_length := get_byte(v_state, 1 + v_day_index * 2) + (get_byte(v_state, 1 + v_day_index * 2 + 1) << 8);

	v_before := substring(v_state FROM 64 FOR (v_target_offset - 63));
	v_after := substring(v_state FROM v_target_offset + v_target_length + 1);

	v_new_offsets := substring(v_state FROM 2 FOR 62);
	v_new_offsets := set_byte(v_new_offsets, v_day_index * 2, v_new_length & 255);
	v_new_offsets := set_byte(v_new_offsets, v_day_index * 2 + 1, (v_new_length >> 8) & 255);

	v_state := set_byte(decode('00', 'hex'), 0, 1) || v_new_offsets || v_before || p_day_payload || v_after;

	UPDATE block_states
	SET state = v_state, updated_at = now()
	WHERE block_id = p_block_id AND month = p_month;

	RETURN v_state;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
