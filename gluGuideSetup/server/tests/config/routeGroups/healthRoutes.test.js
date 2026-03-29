const setupHealthRoutes = require('../../../config/routeGroups/healthRoutes');

jest.mock('../../../middleware/sessionMiddleware', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/glucoseRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/foodItemRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/recipeRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/mealRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/alertRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/notificationRoutes', () => jest.fn((req, res, next) => next()));

jest.mock('../../../controllers/notificationController', () => ({
  getUnread: jest.fn((req, res, next) => next()),
  markRead: jest.fn((req, res, next) => next())
}));

describe('Health Routes Configuration', () => {
  let mockApp;
  
  beforeEach(() => {
    mockApp = { use: jest.fn() };
  });
  
  it('should set up all health-related routes', () => {
    setupHealthRoutes(mockApp);
    
    const calls = mockApp.use.mock.calls;
    
    const hasRoute = (path) => calls.some(call => 
      typeof call[0] === 'string' && call[0].includes(path)
    );

    expect(hasRoute('/glucose')).toBe(true);
    expect(hasRoute('/food')).toBe(true);
    expect(hasRoute('/recipes')).toBe(true);
    expect(hasRoute('/meal')).toBe(true);
    expect(hasRoute('/')).toBe(true);

    expect(mockApp.use.mock.calls.length).toBeGreaterThanOrEqual(4);
  });
});