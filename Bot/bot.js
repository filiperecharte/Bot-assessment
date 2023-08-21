const axios = require('axios');

var botConfig = {
    currencyPairs: (process.env.CURRENCY_PAIRS || "BTC-USD").split(","),
    fetchInterval: parseInt(process.env.FETCH_INTERVAL) || 5,
    oscillation: parseFloat(process.env.OSCILLATION_PERCENTAGE) || 0.01,
    rate: parseFloat(process.env.RATE) || "BID",
}
var initialRate = new Map();
var fetching = setInterval(fetch, botConfig.fetchInterval * 1000);

fetch();

function fetch(){
    for (const currencyPair of botConfig.currencyPairs) {
        axios.get(`https://api.uphold.com/v0/ticker/${currencyPair}`)
        .then(
            function (response) {
                const currentFetch = {
                    bidRate: response.data.bid,
                    askRate: response.data.ask,
                    currency: response.data.currency,
                    currencyPair: currencyPair,
                    date: response.headers.date,
                    percentageChange: 0
                }

                initialRate.has(currencyPair) ? handleFetch(currentFetch) : setupFetch(currentFetch);
            }
        )
        .catch(
            function (error) {
                console.log(error)
                handleErrors(error.response.data, currencyPair);
            }
        )
    }
}

function setupFetch(currentFetch) {
    initialRate.set(currentFetch.currencyPair, {
        bid: currentFetch.bidRate,
        ask: currentFetch.askRate,
    });
}

function handleFetch(currentFetch){
    currentInitialRate = botConfig.rate == 'BID' ? initialRate.get(currentFetch.currencyPair).bid : initialRate.get(currentFetch.currencyPair).ask;
    currentFetchRate = botConfig.rate == 'BID' ? currentFetch.bidRate : currentFetch.askRate;

    // Calculate the percentage change
    currentFetch.percentageChange = ((currentFetchRate - currentInitialRate) / currentInitialRate) * 100;

    if (Math.abs(currentFetch.percentageChange).toFixed(2) >= botConfig.oscillation) {
        logAlert(currentFetch);
    }
}

function logAlert(currentFetch) {
    if (currentFetch.percentageChange > 0) {
        console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} ${botConfig.rate} PRICE INCREASED ${currentFetch.percentageChange.toFixed(2)}%`);
    } else {
        console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} ${botConfig.rate} PRICE DECREASED ${Math.abs(currentFetch.percentageChange).toFixed(2)}%`);
    }
}

function handleErrors(error, currencyPair) {
    switch (error.code){
        case "not_found":
            console.log(`Currency pair ${currencyPair} not found. Removing from list.`);
            botConfig.currencyPairs.splice(botConfig.currencyPairs.indexOf(currencyPair), 1);
            break;
        case "too_many_requests":
            console.log("Too many requests. Increasing fetch interval by 5s.");
            botConfig.fetchInterval += 5;
            break;
    }
}

function stopFetch() {
    clearInterval(fetching);
}