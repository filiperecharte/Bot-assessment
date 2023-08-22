const axios = require('axios');

var fetching;

function startFetch(botConfig) {
    fetch(botConfig);
    fetching = setInterval(() => fetch(botConfig), botConfig.fetchInterval * 1000);
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

                botConfig.initialRate.has(currencyPair) ? handleFetch(botConfig, currentFetch) : setupFetch(botConfig, currentFetch);
            },
        )
        .catch(
            (error) => {
                console.log(`Error fetching ${currencyPair}`);
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
    currentFetch.percentageChange = currentInitialRate === 0 ? 0 : ((currentFetchRate - currentInitialRate) / currentInitialRate) * 100;

    if (Math.abs(currentFetch.percentageChange).toFixed(2) >= botConfig.oscillation) {
        logAlert(botConfig, currentFetch);
    }
}

function logAlert(botConfig, currentFetch) {
    if (currentFetch.percentageChange > 0) {
        console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} ${botConfig.rate} PRICE INCREASED ${currentFetch.percentageChange.toFixed(2)}%`);
    } else {
        console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} ${botConfig.rate} PRICE DECREASED ${Math.abs(currentFetch.percentageChange).toFixed(2)}%`);
    }
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

function stopFetch() {
    clearInterval(fetching);
}

module.exports = {
    fetch,
    handleFetch,
    handleErrors,
    startFetch,
    stopFetch,
};