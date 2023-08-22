const { Client } = require('pg')

function connectDB() {
    const client = new Client({
        user: 'user',
        host: 'database',
        database: 'db',
        password: 'pass',
        port: 5432,
      });

    client.connect().then(() => {
        client.query('SELECT NOW()', (err, res) => {
        console.log(res.rows)
        });
    });

    return client;
}

async function saveBot(botConfig) {
    let res;
    try {
        res = await botConfig.clientDB.query('INSERT INTO Bot (currencyPairs, fetchInterval, oscillation, rate) VALUES ($1, $2, $3, $4) RETURNING id', 
        [botConfig.currencyPairs, botConfig.fetchInterval, botConfig.oscillation, botConfig.rate])

        botConfig.id = res.rows[0].id;
    } catch (err) {
        console.log(err);
    }
}

//insert alerts in database
function saveAlert(botConfig, alert) {
    botConfig.clientDB.query('INSERT INTO Alert (currencyPair, percentageChange, date, bot_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [alert.currencyPair, alert.percentageChange, alert.date, botConfig.id], (err, res) => {
        if (err) {
            console.log(err)
        } else {
            console.log(`Alert ${res.rows[0].id} saved for bot ${botConfig.id}`)
        }
    })
}

module.exports = { connectDB, saveBot, saveAlert }