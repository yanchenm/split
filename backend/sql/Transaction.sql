CREATE TABLE IF NOT EXISTS Transaction (
    id CHAR(32) PRIMARY KEY,
    `group` CHAR(32) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency CHAR(3) NOT NULL,
    paid_by VARCHAR(42) NOT NULL,
    name VARCHAR(64) NOT NULL,
    date DATE NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE NOW(),
    KEY group_id_idx (`group`),
    KEY paid_by_idx (paid_by)
);