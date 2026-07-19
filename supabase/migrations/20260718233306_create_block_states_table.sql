CREATE TABLE block_states_monthly (
	block_id uuid NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
	month date NOT NULL,
	encoding smallint NOT NULL DEFAULT 1,
	state bytea NOT NULL DEFAULT ('\x01' || repeat('\x0000', 31))::bytea,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (block_id, month),
	CONSTRAINT block_states_monthly_month_is_first_day CHECK (date_trunc('month', month) = month)
);

CREATE INDEX block_states_monthly_block_id_idx ON block_states_monthly (block_id);
