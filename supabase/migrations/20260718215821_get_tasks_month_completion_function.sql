-- Returns per-day completion booleans for multiple tasks within one month,
-- unpacking the bitmap server-side so the client never parses bytea.
CREATE OR REPLACE FUNCTION get_tasks_month_completion(
	p_task_ids uuid[],
	p_month date
) RETURNS TABLE (
	task_id uuid,
	day_of_month integer,
	completed boolean
) AS $$
	SELECT
		s.task_id,
		day_series.day_of_month,
		(get_byte(s.completed, (day_series.day_of_month - 1) / 8)
			& (1 << ((day_series.day_of_month - 1) % 8))) != 0 AS completed
	FROM states s
	CROSS JOIN LATERAL generate_series(1, EXTRACT(DAY FROM (p_month + interval '1 month' - interval '1 day'))::integer) AS day_series(day_of_month)
	WHERE s.task_id = ANY(p_task_ids)
		AND s.month = p_month;
$$ LANGUAGE sql STABLE SECURITY INVOKER;
