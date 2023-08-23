const { connectDB, saveBot, saveAlert } = require('./database'); // Update the path accordingly
const { Client } = require('pg');

jest.mock('pg');

describe('Database Functions', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new Client();
    mockClient.connect = jest.fn(() => Promise.resolve());
    mockClient.query = jest.fn();
    Client.mockReturnValue(mockClient);

    console.log = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('connectDB should connect to the database', async () => {
    connectDB();

    expect(mockClient.connect).toHaveBeenCalled();
  });


  test('saveBot should insert bot configuration into the database', async () => {
    const botConfig = {
      currencyPairs: 'BTC-USD',
      fetchInterval: 5,
      oscillation: 0.01,
      rate: 'BID',
      clientDB: mockClient,
    };

    const mockRows = { rows: [{ id: 123 }] };
    mockClient.query.mockImplementationOnce((_, __, callback) => {
      callback(null, mockRows);
    });

    const callback = jest.fn();

    saveBot(botConfig, callback);

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO Bot (currencyPairs, fetchInterval, oscillation, rate) VALUES ($1, $2, $3, $4) RETURNING id',
      ['BTC-USD', 5, 0.01, 'BID'],
      expect.any(Function)
    );

    expect(botConfig.id).toBe(123);
    expect(callback).toHaveBeenCalled();
  });


  test('saveAlert should insert alert into the database', async () => {
    const botConfig = {
      id: 123,
      clientDB: mockClient,
    };

    const alert = {
      currencyPair: 'BTC-USD',
      percentageChange: 0.05,
      date: '2023-08-30',
    };

    const mockRows = { rows: [{ id: 456 }] };
    mockClient.query.mockImplementationOnce((_, __, callback) => {
      callback(null, mockRows);
    });

    saveAlert(botConfig, alert);

    expect(mockClient.query).toHaveBeenCalledWith(
      'INSERT INTO Alert (currencyPair, percentageChange, date, bot_id) VALUES ($1, $2, $3, $4) RETURNING id',
      ['BTC-USD', 0.05, '2023-08-30', 123],
      expect.any(Function)
    );

    expect(console.log).toHaveBeenCalledWith(
      'Alert 456 saved for bot 123'
    );
  });

});