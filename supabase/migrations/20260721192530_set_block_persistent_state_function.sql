-- Persistent ("сквозной") block state: one row per block with month = NULL,
-- state holds the single-value payload directly (no day-offsets bitmap framing).
CREATE OR REPLACE FUNCTION set_block_persistent_state(
	p_block_id uuid,
	p_state_payload_hex text
) RETURNS bytea AS $$
DECLARE
	v_payload bytea := decode(p_state_payload_hex, 'hex');
BEGIN
	INSERT INTO block_states (block_id, month, state)
	VALUES (p_block_id, NULL, v_payload)
	ON CONFLICT (block_id, month) DO UPDATE SET state = v_payload, updated_at = now();

	RETURN v_payload;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER;
