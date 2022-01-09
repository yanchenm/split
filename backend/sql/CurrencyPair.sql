CREATE TABLE IF NOT EXISTS CurrencyPair (
    in_currency CHAR(3) NOT NULL,
    out_currency CHAR(3) NOT NULL,
    rate FLOAT NOT NULL,
    fetched TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (in_currency, out_currency, fetched)
);