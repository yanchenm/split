CREATE TABLE IF NOT EXISTS Membership (
    `group` CHAR(32) NOT NULL,
    user VARCHAR(42) NOT NULL,
    status VARCHAR(16) NOT NULL,
    KEY group_id_idx (`group`),
    KEY user_address_idx (user),
    PRIMARY KEY (`group`, user)
);