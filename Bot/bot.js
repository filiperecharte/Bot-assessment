const axios = require('axios');

const {saveAlert} = require('./database.js');

function startFetch(botConfig) {
    fetch(botConfig);
    setInterval(() => fetch(botConfig), botConfig.fetchInterval * 1000);
}

function fetch(botConfig) {
    for (const currencyPair of botConfig.currencyPairs) {
        axios.get(`https://api.uphold.com/v0/ticker/${currencyPair}`)
        .then(
            (response) => {
                const currentFetch = {
                    bidRate: response.data.bid,
                    askRate: response.data.ask,
                    currency: response.data.currency,
                    currencyPair,
                    date: response.headers.date,
                    percentageChange: 0,
                };

                if (currentFetch.bidRate === undefined || currentFetch.askRate === undefined || currentFetch.currency === undefined) {
                    throw { response: { data: { code: 'not_found', message: `Currency pair ${currencyPair} not found.`}}};
                }

                botConfig.initialRate.has(currencyPair) ? handleFetch(botConfig, currentFetch) : setupFetch(botConfig, currentFetch);
            },
        )
        .catch(
            (error) => {
                handleErrors(botConfig, error.response.data, currencyPair);
            },
        );
    }
}

function setupFetch(botConfig, currentFetch) {
    botConfig.initialRate.set(currentFetch.currencyPair, {
        bid: currentFetch.bidRate,
        ask: currentFetch.askRate,
    });
}

function handleFetch(botConfig, currentFetch) {
    const currentInitialRate = botConfig.rate === 'BID' ? botConfig.initialRate.get(currentFetch.currencyPair).bid : botConfig.initialRate.get(currentFetch.currencyPair).ask;
    const currentFetchRate = botConfig.rate === 'BID' ? currentFetch.bidRate : currentFetch.askRate;

    // Calculate the percentage change
    currentFetch.percentageChange = currentInitialRate === 0 ? 0 : (((currentFetchRate - currentInitialRate) / currentInitialRate) * 100).toFixed(2);

    if (Math.abs(currentFetch.percentageChange) >= botConfig.oscillation) {
        createAlert(botConfig, currentFetch);
    }
}

function createAlert(botConfig, currentFetch) {

    const alert = {
        currencyPair: currentFetch.currencyPair,
        rate: botConfig.rate,
        direction: currentFetch.percentageChange > 0 ? 'UP' : 'DOWN',
        percentageChange: Math.abs(currentFetch.percentageChange),
        date: currentFetch.date,
    };

    console.log(`[ ${alert.date} ] ${alert.currencyPair} ${alert.rate} PRICE ${alert.direction} ${alert.percentageChange}%`);
    
    saveAlert(botConfig, alert);
}

function handleErrors(botConfig, error, currencyPair) {
    switch (error.code) {
        case 'not_found':
            console.log(`Currency pair ${currencyPair} not found. Removing from list.`);
            botConfig.currencyPairs.splice(botConfig.currencyPairs.indexOf(currencyPair), 1);
            break;
        case 'too_many_requests':
            console.log('Too many requests. Increasing fetch interval by 5s.');
            botConfig.fetchInterval += 5;
            break;
        default:
            console.log(error.message);
            break;
    }
}

module.exports = {
    fetch,
    handleFetch,
    setupFetch,
    handleErrors,
    startFetch,
    createAlert,
};