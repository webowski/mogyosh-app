ALTER TABLE states RENAME TO states_legacy;
ALTER TABLE states_monthly RENAME TO states;
ALTER INDEX states_monthly_task_id_idx RENAME TO states_task_id_idx;
ALTER TABLE states RENAME CONSTRAINT states_monthly_month_is_first_day TO states_month_is_first_day;
