const axios = require('axios');

const currencyPairs = (process.env.CURRENCY_PAIRS || "BTC-USD").split(",");
const fetchInterval = parseInt(process.env.FETCH_INTERVAL) || 5;
const oscillation = parseFloat(process.env.OSCILLATION_PERCENTAGE) || 0.01;

var initialRate = new Map();
var fetching = setInterval(fetch, fetchInterval * 1000);

fetch();

function fetch(){
    for (const currencyPair of currencyPairs) {
        console.log(`Fetching ${currencyPair}...`);
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
                console.log(error.message);
            }
        )
    }
}

function setupFetch(currentFetch) {
    initialRate.set(currentFetch.currencyPair,{
        bid: currentFetch.bidRate,
        ask: currentFetch.askRate
    });
}

function handleFetch(currentFetch){
    currentInitialRate = initialRate.get(currentFetch.currencyPair);

    // Calculate the percentage change
    currentFetch.percentageChange = ((currentFetch.bidRate - currentInitialRate.bid) / currentInitialRate.bid) * 100;

    // Log the percentage change
    if (Math.abs(currentFetch.percentageChange).toFixed(2) >= oscillation) {
        if (currentFetch.percentageChange > 0) {
            console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} BID PRICE INCREASED ${currentFetch.percentageChange.toFixed(2)}%`);
        } else {
            console.log(`[ ${currentFetch.date} ] ${currentFetch.currencyPair} BID PRICE DECREASED ${Math.abs(currentFetch.percentageChange).toFixed(2)}%`);
        }
    }
}

function stopFetch() {
    clearInterval(fetching);
}