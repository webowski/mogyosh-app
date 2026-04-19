INSERT INTO public.profiles (id, updated_at, username) VALUES
('86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-02-27 17:50:27+00', 'webowski');


INSERT INTO public.categories (id, user_id, name, parent_id, created_at) VALUES
('c8b67778-de7a-4107-9600-6beb63d5d58e', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', 'Здоровье', NULL, '2026-04-18 02:41:23.328679+00'),
('35240942-ba74-4cb1-bfdf-c40754bfdf41', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', 'Заработок', NULL, '2026-04-18 02:58:19.533303+00'),
('a865b5b8-c974-41b6-9192-3fef3e4d86f6', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', 'Купить', NULL, '2026-04-18 02:59:37.340679+00'),
('4238188e-c3dc-45b9-8705-4929c9347880', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', 'Обучение', NULL, '2026-04-18 02:58:41.218943+00');


INSERT INTO public.tasks (id, user_id, created_at, parent_id, category_id, info, status, priority, updated_at) VALUES
('a224c265-f968-4a12-a1bf-5166ccee1893', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-04-18 02:56:14.11666+00', NULL, '35240942-ba74-4cb1-bfdf-c40754bfdf41', 'Проект #1 для клиента #1', 'active', NULL, '2026-04-18 03:00:34.319356+00'),
('584d52c6-e235-4f01-80c1-fa8313e5ca57', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-03-01 01:37:35.710145+00', NULL, 'a865b5b8-c974-41b6-9192-3fef3e4d86f6', 'Продукты', 'active', NULL, '2026-04-18 03:00:45.701556+00'),
('ad8dd663-d14d-4fc0-906d-8f2593c37ea6', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-02-27 21:35:59.128721+00', NULL, 'c8b67778-de7a-4107-9600-6beb63d5d58e', 'Жиросжигание', 'active', NULL, '2026-04-18 03:00:55.463936+00'),
('b21df5d6-d394-47c4-a8ec-0f5b8a421903', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-02-27 17:53:59+00', NULL, 'c8b67778-de7a-4107-9600-6beb63d5d58e', 'Тяговые упражнения', 'active', NULL, '2026-04-18 03:01:09.791617+00'),
('ea2d75fc-dfcb-4e4c-8787-5d48618b1191', '86048ba9-73fc-40ce-aa14-7ad4c93224e6', '2026-04-15 23:21:07.735998+00', NULL, '4238188e-c3dc-45b9-8705-4929c9347880', 'Гитара', 'active', NULL, '2026-04-18 03:01:21.705033+00');


INSERT INTO public.schedules (id, task_id, type, start_time, end_time, date, weekday, month_day, month, start_date, end_date, created_at) VALUES
('5d0f42b7-5a31-41ac-93a2-ad7237c2d919', 'a224c265-f968-4a12-a1bf-5166ccee1893', 'once', '10:30:00', '18:00:00', NULL, NULL, NULL, NULL, '2026-04-18', NULL, '2026-04-18 03:34:35.157825+00'),
('3e253d1a-20a8-4fd4-9158-e6c849671830', '584d52c6-e235-4f01-80c1-fa8313e5ca57', 'once', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18', NULL, '2026-04-18 04:20:54.155002+00'),
('b441269d-5d62-4619-ba72-7cbbb2013ad0', 'ad8dd663-d14d-4fc0-906d-8f2593c37ea6', 'once', NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-18', NULL, '2026-04-18 04:23:32.04222+00'),
('b66b3761-6883-4163-a549-eb0276d09702', 'b21df5d6-d394-47c4-a8ec-0f5b8a421903', 'weekday', '20:00:00', '21:00:00', NULL, NULL, NULL, NULL, '2026-04-18', NULL, '2026-04-18 04:24:46.669099+00'),
('365b4cfc-483a-41e8-ac9a-f5652ff13da7', 'ea2d75fc-dfcb-4e4c-8787-5d48618b1191', 'weekday', '19:00:00', NULL, NULL, NULL, NULL, NULL, '2026-04-18', NULL, '2026-04-18 04:26:35.901085+00');
