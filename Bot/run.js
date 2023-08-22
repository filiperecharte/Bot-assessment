const { startFetch, stopFetch } = require('./bot');
const { connectDB, saveBot } = require('./connect');

function run() {
    const clientDB = connectDB();

    var botConfig = {
        currencyPairs: ((process.env.CURRENCY_PAIRS && process.env.CURRENCY_PAIRS.trim()) || 'BTC-USD').split(','),
        fetchInterval: Math.max((process.env.FETCH_INTERVAL && parseInt(process.env.FETCH_INTERVAL)),1) || 5,
        oscillation: Math.max((process.env.OSCILLATION_PERCENTAGE && parseFloat(process.env.OSCILLATION_PERCENTAGE)), 0.01) || 0.01,
        rate: (process.env.RATE === 'ASK' || process.env.RATE === 'BID') ? process.env.RATE : 'BID',
        initialRate: new Map(),
        clientDB: clientDB,
        id: null,
    };

    saveBot(botConfig).then(() => {
        console.log(`Bot ${botConfig.id} saved`);
        startFetch(botConfig);
    });
}

function stop() {
    stopFetch();
}

run();