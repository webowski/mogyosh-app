CREATE TABLE states_monthly (
	task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
	month date NOT NULL,
	completed bytea NOT NULL DEFAULT '\x00000000'::bytea,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	PRIMARY KEY (task_id, month),
	CONSTRAINT states_monthly_month_is_first_day
		CHECK (date_trunc('month', month) = month)
);

CREATE INDEX states_monthly_task_id_idx ON states_monthly (task_id);
