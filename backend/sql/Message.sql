CREATE TABLE IF NOT EXISTS Message (
    id CHAR(32) PRIMARY KEY,
    user VARCHAR(42) NOT NULL,
    title VARCHAR(64) NOT NULL,
    message VARCHAR(512) NOT NULL,
    `group` VARCHAR(32),
    tx_id VARCHAR(32),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    seen BOOLEAN NOT NULL DEFAULT FALSE,
    KEY user_idx (user),
    KEY group_id_idx (`group`),
    KEY tx_id_idx (tx_id)
);