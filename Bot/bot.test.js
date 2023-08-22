const axios = require('axios');
jest.mock('axios');

var { fetch, handleFetch, handleErrors } = require('./bot.js');

describe('Bot functions', () => {

    beforeAll(() => {
        botConfig = {
            currencyPairs: ["BTC-USD", "ETH-USD"],
            rate: 'BID',
            oscillation: 0.01,
            fetchInterval: 5,
            initialRate: new Map(),
        };
    });

  test('fetch should call axios.get correctly', async () => {

    const mockResponse = { 
        data: { bid: '26130.3060620596', ask: '26015.5743912126', currency: 'USD'}, 
        headers: { Date: 'Mon, 21 Aug 2023 20:28:27 GMT' }
    };

    axios.get.mockResolvedValue(mockResponse);

    await fetch(botConfig);

    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith('https://api.uphold.com/v0/ticker/BTC-USD');
  });

  test('handleFetch should calculate percentage change correctly', () => {
    botConfig.initialRate.set('BTC-USD', { bid: '26110.3060620596', ask: '26015.5743912126' });

    const currentFetch = {
        bidRate: '26130.3060620596',
        askRate: '26015.5743912126',
        currency: 'USD',
        currencyPair: 'BTC-USD',
        date: 'Mon, 21 Aug 2023 20:28:27 GMT',
        percentageChange: 0,
    };

    handleFetch(botConfig, currentFetch);

    expect(currentFetch.percentageChange).toBe(0.07659810632806648);
  });

  test('handleErrors should handle not found error correctly', () => {
    const errorResponseData = {
        code: 'not_found',
        message: 'Not Found',
    };

    handleErrors(botConfig, errorResponseData, 'BTC-USD');

    expect(botConfig.currencyPairs).toEqual(["ETH-USD"]);
  });

  test('handleErrors should handle too many requests error correctly', () => {
    const errorResponseData = {
        code: 'too_many_requests',
        message: 'Too Many Requests',
    };

    handleErrors(botConfig, errorResponseData, 'BTC-USD');

    expect(botConfig.fetchInterval).toBe(10);
  });

});
