-- Drop the PK since primary key columns cannot be nullable, replace with a
-- unique constraint that treats multiple NULLs in `month` as duplicates
-- (Postgres 17 supports NULLS NOT DISTINCT) — this lets ON CONFLICT (block_id, month)
-- work uniformly for both journaled (month = date) and persistent (month = NULL) rows.
ALTER TABLE block_states DROP CONSTRAINT block_states_monthly_pkey;
ALTER TABLE block_states ALTER COLUMN month DROP NOT NULL;
ALTER TABLE block_states ADD CONSTRAINT block_states_block_id_month_key
	UNIQUE NULLS NOT DISTINCT (block_id, month);
