CREATE TABLE IF NOT EXISTS `Group` (
    id CHAR(32) PRIMARY KEY,
    name VARCHAR(64) NOT NULL,
    currency CHAR(3) NOT NULL,
    description VARCHAR(512),
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
);