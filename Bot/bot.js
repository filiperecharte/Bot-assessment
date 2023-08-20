const axios = require('axios');

var initialRate;

fetch();

function fetch(){
    axios.get("https://api.uphold.com/v0/ticker/BTC-USD")
    .then(
        function (response) {
            const currentFetch = {
                bidRate: response.data.bid,
                askRate: response.data.ask,
                currency: response.data.currency,
                date: response.headers.date,
                percentageChange: 0
            }

            initialRate ? handleFetch(currentFetch) : setupFetch(currentFetch);
        }
    )
    .catch(
        function (error) {
            console.log(error);
        }
    )
}

function setupFetch(currentFetch) {
    initialRate = {
        bid: currentFetch.bidRate,
        ask: currentFetch.askRate
    }
    fetching = setInterval(fetch, 5000);
}

function handleFetch(currentFetch){

    // Calculate the percentage change
    currentFetch.percentageChange = ((currentFetch.bidRate - initialRate.bid) / initialRate.bid) * 100;

    // Log the percentage change
    if (+Math.abs(currentFetch.percentageChange).toFixed(2) >= 0.01) {
        if (currentFetch.percentageChange > 0) {
            console.log(`[ ${currentFetch.date} ] BTC-USD BID PRICE INCREASED ${currentFetch.percentageChange.toFixed(2)}%`);
        } else {
            console.log(`[ ${currentFetch.date} ] BTC-USD BID PRICE DECREASED ${Math.abs(currentFetch.percentageChange).toFixed(2)}%`);
        }
    }
}

function stopRetrieving() {
    clearInterval(fetching);
}