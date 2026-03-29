const setupHealthRoutes = require('../../../config/routeGroups/healthRoutes');

// Mock all dependencies using inline functions to keep Jest happy
jest.mock('../../../middleware/sessionMiddleware', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/glucoseRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/foodItemRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/recipeRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/mealRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/alertRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/notificationRoutes', () => jest.fn((req, res, next) => next()));
jest.mock('../../../routes/exportRoutes', () => jest.fn((req, res, next) => next()));

// Mock the notification controller to prevent "Requires callback" errors
jest.mock('../../../controllers/notificationController', () => ({
  getUnread: jest.fn((req, res, next) => next()),
  markRead: jest.fn((req, res, next) => next())
}));

describe('Health Routes Configuration', () => {
  let mockApp;
  
  beforeEach(() => {
    mockApp = { use: jest.fn() };
  });
  
  it('should set up all 7 health-related routes correctly', () => {
    setupHealthRoutes(mockApp);
    
    const calls = mockApp.use.mock.calls;
    
    // Helper to find if a path was registered
    const hasPath = (path) => calls.some(call => call[0] === path);

    // Verify all specific paths
    expect(hasPath('/glucose')).toBe(true);
    expect(hasPath('/food')).toBe(true);
    expect(hasPath('/recipes')).toBe(true);
    expect(hasPath('/meal')).toBe(true);
    expect(hasPath('/export')).toBe(true);
    
    // Verify the root mounts (for alerts and notifications)
    const rootMounts = calls.filter(call => call[0] === '/');
    expect(rootMounts.length).toBe(2); 

    // Total count must be 7
    expect(mockApp.use).toHaveBeenCalledTimes(7);
  });
});