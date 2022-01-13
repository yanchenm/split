CREATE TABLE Invite (
    group_id CHAR(32) PRIMARY KEY,
    invite_code VARCHAR(64) NOT NULL,
    status VARCHAR(16) NOT NULL,
    created_by VARCHAR(42) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP);