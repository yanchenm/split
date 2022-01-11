CREATE TABLE IF NOT EXISTS Split (
    tx_id CHAR(32) NOT NULL,
    user VARCHAR(42) NOT NULL,
    share DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (tx_id, user),
    KEY tx_id_idx (tx_id),
    KEY user_idx (user)
);