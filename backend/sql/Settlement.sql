CREATE TABLE Settlement (
    sender VARCHAR(42) NOT NULL,
    receiver VARCHAR(42) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    txn_hash CHAR(66) NOT NULL,
    txn_id CHAR(32) DEFAULT NULL,
    status VARCHAR(16) NOT NULL,
    group_id CHAR(32) NOT NULL,
    PRIMARY KEY (sender, receiver, group_id, txn_hash)
);