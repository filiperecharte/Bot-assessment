DROP TABLE IF EXISTS Bot;

CREATE TABLE Bot (
    id SERIAL PRIMARY KEY,
    currencyPairs TEXT NOT NULL,
    fetchInterval REAL NOT NULL,
    oscillation REAL NOT NULL,
    rate TEXT NOT NULL
);

CREATE TABLE Alert (
    id SERIAL PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    currencyPair TEXT NOT NULL,
    percentageChange REAL NOT NULL,
    bot_id INTEGER REFERENCES Bot(id)
);