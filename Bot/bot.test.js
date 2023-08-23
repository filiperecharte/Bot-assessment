const axios = require('axios');
var { saveAlert } = require('./database.js');
var { startFetch, fetch, handleFetch, handleErrors, setupFetch } = require('./bot.js');

jest.mock('axios');

jest.mock('./database', () => {
    return {
    ...jest.requireActual('./database'),
    saveAlert: jest.fn(),
  };
});

describe('Bot functions', () => {

  beforeEach(() => {
    //setup bot configuration
    botConfig = {
      currencyPairs: ["BTC-USD", "ETH-USD"],
      rate: 'BID',
      oscillation: 0.01,
      fetchInterval: 5,
      initialRate: new Map(),
    };

    //simulate response from API
    mockResponse = { 
      data: { bid: '26130.3060620596', ask: '26015.5743912126', currency: 'USD'}, 
      headers: { date: 'Mon, 21 Aug 2023 20:28:27 GMT' }
    };

    firstFetch = {
      bidRate: '26001.3060620596',
      askRate: '26001.5743912126',
      currency: mockResponse.data.currency,
      date: mockResponse.headers.date,
      currencyPair: 'BTC-USD',
      percentageChange: 0,
    };

    currentFetch = {
      bidRate: '26110.3060620596',
      askRate: '26012.5743912126',
      currency: mockResponse.data.currency,
      date: mockResponse.headers.date,
      currencyPair: 'BTC-USD',
      percentageChange: 0,
    };

    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  test('fetch should call axios.get correctly', async () => {
    axios.get.mockResolvedValue(mockResponse);

    fetch(botConfig);

    expect(axios.get).toHaveBeenCalledTimes(botConfig.currencyPairs.length);
    for (const currencyPair of botConfig.currencyPairs) {
      expect(axios.get).toHaveBeenCalledWith(`https://api.uphold.com/v0/ticker/${currencyPair}`);
    }
  });


  test('handleFetch should calculate percentage change correctly', () => {
    setupFetch(botConfig, firstFetch);

    handleFetch(botConfig, currentFetch);

    const alert = {
      currencyPair: currentFetch.currencyPair,
      rate: botConfig.rate,
      direction: currentFetch.percentageChange > 0 ? 'UP' : 'DOWN',
      percentageChange: currentFetch.percentageChange,
      date: currentFetch.date,
    };

    expect(currentFetch.percentageChange).toBe('0.42');
    expect(saveAlert).toHaveBeenCalledWith(botConfig, alert);
  });


  test('handleErrors should handle not found error correctly', () => {
    const errorResponseData = {
      code: 'not_found',
      message: 'Not Found',
    };

    const failedCurrencyPair = botConfig.currencyPairs[0];

    handleErrors(botConfig, errorResponseData, botConfig.currencyPairs[0]);

    expect(botConfig.currencyPairs.includes(failedCurrencyPair)).toEqual(false);
  });


  test('handleErrors should handle too many requests error correctly', () => {
    const errorResponseData = {
      code: 'too_many_requests',
      message: 'Too Many Requests',
    };

    const previousFetchInterval = botConfig.fetchInterval;

    handleErrors(botConfig, errorResponseData, botConfig.currencyPairs[0]);

    expect(botConfig.fetchInterval).toBe(previousFetchInterval + 5);
  });


  test('should call fetch with botConfig and schedule subsequent fetches', async () => {
    jest.useFakeTimers();

    axios.get.mockResolvedValue(mockResponse);

    startFetch(botConfig);

    expect(axios.get).toHaveBeenCalledTimes(botConfig.currencyPairs.length);
    for (const currencyPair of botConfig.currencyPairs) {
      expect(axios.get).toHaveBeenCalledWith(`https://api.uphold.com/v0/ticker/${currencyPair}`);
    }

    jest.advanceTimersByTime(botConfig.fetchInterval * 1000);

    expect(axios.get).toHaveBeenCalledTimes(botConfig.currencyPairs.length * 2);
    for (const currencyPair of botConfig.currencyPairs) {
      expect(axios.get).toHaveBeenCalledWith(`https://api.uphold.com/v0/ticker/${currencyPair}`);
    }

    jest.advanceTimersByTime(botConfig.fetchInterval * 1000);

    expect(axios.get).toHaveBeenCalledTimes(botConfig.currencyPairs.length * 3);
    for (const currencyPair of botConfig.currencyPairs) {
      expect(axios.get).toHaveBeenCalledWith(`https://api.uphold.com/v0/ticker/${currencyPair}`);
    }
  });
});
