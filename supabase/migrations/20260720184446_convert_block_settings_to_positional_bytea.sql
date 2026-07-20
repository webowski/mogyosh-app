-- 0x01 = settings codec version 1, 0x90 = msgpack empty array (fixarray, 0 elements)
ALTER TABLE blocks ADD COLUMN settings_bytes bytea NOT NULL DEFAULT decode('0190', 'hex');

ALTER TABLE blocks DROP COLUMN settings;
ALTER TABLE blocks RENAME COLUMN settings_bytes TO settings;
