const { Client } = require('pg')

function connectDB() {
    const client = new Client({
        user: process.env.DATABASE_USER,
        host: process.env.DATABASE_HOST,
        database: process.env.DATABASE_NAME,
        password: process.env.DATABASE_PASSWORD,
        port: process.env.DATABASE_PORT,
      });

    client.connect().then(() => {
        console.log('Connected to database');
    }).catch((err) => {
        console.log(err);
    });

    return client;
}

function saveBot(botConfig, callback) {
    botConfig.clientDB.query('INSERT INTO Bot (currencyPairs, fetchInterval, oscillation, rate) VALUES ($1, $2, $3, $4) RETURNING id', 
    [botConfig.currencyPairs, botConfig.fetchInterval, botConfig.oscillation, botConfig.rate],(err, res) => {
        if (err) {
            console.log(err);
        } else {
            botConfig.id = res.rows[0].id;
            callback();
        }
    });
}

//insert alerts in database
function saveAlert(botConfig, alert) {
    botConfig.clientDB.query('INSERT INTO Alert (currencyPair, percentageChange, date, bot_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [alert.currencyPair, alert.percentageChange, alert.date, parseInt(botConfig.id)], (err, res) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Alert ${res.rows[0].id} saved for bot ${botConfig.id}`);
        }
    });
}

module.exports = { 
    connectDB, 
    saveBot, 
    saveAlert 
}