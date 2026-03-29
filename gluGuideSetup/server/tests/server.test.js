const express = require('express');
const cors = require('cors');


jest.mock('express', () => {
  const mockApp = {
    use: jest.fn(),
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    }),
  };
  const mockExpress = jest.fn(() => mockApp);
  mockExpress.static = jest.fn(() => 'staticMiddleware');
  return mockExpress;
});


jest.mock('cors', () => jest.fn(() => 'corsMiddleware'));
jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('../config/corsConfig', () => ({ origin: ['http://localhost:5173'] }));
jest.mock('../config/sessionConfig', () => jest.fn());
jest.mock('../config/middlewareConfig', () => jest.fn());
jest.mock('../config/routesConfig', () => jest.fn());


jest.mock('../cron/sendReminders', () => ({}), { virtual: true }); 

describe('Server', () => {
  let consoleLogSpy;
  
  beforeEach(() => {
    jest.clearAllMocks();

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });
  
  afterEach(() => {
    consoleLogSpy.mockRestore();

    jest.resetModules();
  });
  
  it('should set up the server correctly with all middleware and routes', () => {

    require('../server');
    
    const mockApp = express();
    

    expect(cors).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('corsMiddleware');
    

    expect(express.static).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalledWith('/uploads', 'staticMiddleware');
    

    const sessionConfig = require('../config/sessionConfig');
    expect(sessionConfig).toHaveBeenCalledWith(mockApp);
    
    const setupMiddleware = require('../config/middlewareConfig');
    expect(setupMiddleware).toHaveBeenCalledWith(mockApp);
    

    const setupRoutes = require('../config/routesConfig');
    expect(setupRoutes).toHaveBeenCalledWith(mockApp);
    

    expect(mockApp.listen).toHaveBeenCalledWith(8080, expect.any(Function));
    

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('http://localhost:8080'));
  });
});