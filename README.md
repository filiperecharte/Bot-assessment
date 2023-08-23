# Uphold-Bot
Uphold assessment: Bot that is able to alert you about price oscillations on a given currency pair

## Requirements

- Docker 

- docker-compose 

## Bot Configuration

| Argument |  Value | Function | Default
|---|---|---|---|
| CURRENCY_PAIRS  | Tags available at Uphold API separated by comma (e.g. "BTC-USD,ETH-USD"; "BTC-USD") |  Specify currency pairs for which alerts should be received | BTC-USD |
| FETCH_INTERVAL  | Number (seconds) |  Specify API data retrieval interval | 5 |
| OSCILLATION  | Number (percentage) | Specify bot's oscillation alert percentage | 0.01 |
| RATE | BID or ASK |  Specify which rate the bot should check | BID |

## Bot program (bot & database)

### Build docker images

Inside ``Uphold-Bot`` folder, build bot and database images:

```
docker-compose build
```

### Run docker containers

Run bot and database containers with default arguments:

```
docker-compose up
```

Run bot and database containers with custom arguments:

```
CURRENCY_PAIRS=currency_pairs FETCH_INTERVAL=fetch_interval OSCILLATION=oscillation RATE=rate docker-compose up
```

Stop containers:

```
docker-compose down \\stop both containers
docker-compose down bot \\stop bot container (to setup other bot)
```

## Database

Every time a bot is created it is added to the postgres database with its configuration. Alerts are also stored in the database.

### Access database

Enter docker container terminal:

```
docker exec -it uphold-bot-database-1 bash
```

Enter postgres terminal:

```
psql -U user -d db
```

## Testing

Inside ``Bot`` folder, test the bot implementation:

```
npm run test
```

## Considerations

- The bot keeps alerting the user every time it notices that the rate variation exceeded the oscillation value
- Since it was not specified which rate should be taken into account, it is possible to choose between Bid or Ask rates
- A .env file was not created to facilitate the program's running.