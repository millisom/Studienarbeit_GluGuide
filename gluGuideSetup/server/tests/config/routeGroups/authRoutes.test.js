const setupAuthRoutes = require('../../../config/routeGroups/authRoutes');

jest.mock('../../../routes/authRoutes', () => 'authRoutes');
jest.mock('../../../routes/profileRoutes', () => 'profileRoutes');

describe('Auth Routes Configuration', () => {
  let mockApp;
  let mockRes;
  
  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn().mockReturnThis()
    };
    
    mockApp = {
      use: jest.fn(),
      get: jest.fn(),
      post: jest.fn()
    };
  });
  
  it('should set up auth, profile, and logout routes', () => {
    setupAuthRoutes(mockApp);
    
    expect(mockApp.use).toHaveBeenCalledWith('/', 'authRoutes');
    expect(mockApp.use).toHaveBeenCalledWith('/', 'profileRoutes');
    expect(mockApp.get).toHaveBeenCalledWith('/currentUser', expect.any(Function));
    expect(mockApp.post).toHaveBeenCalledWith('/logout', expect.any(Function));
  });
  
  it('should return user ID when session exists at /currentUser', () => {
    setupAuthRoutes(mockApp);
    const currentUserHandler = mockApp.get.mock.calls.find(call => call[0] === '/currentUser')[1];
    const mockReq = { session: { userId: 123 } };
    
    currentUserHandler(mockReq, mockRes);
    
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ userId: 123 });
  });

  it('should destroy session and return 200 on /logout', () => {
    setupAuthRoutes(mockApp);
    const logoutHandler = mockApp.post.mock.calls.find(call => call[0] === '/logout')[1];
    const mockReq = {
      session: {
        destroy: jest.fn((callback) => callback(null))
      }
    };
    
    logoutHandler(mockReq, mockRes);
    
    expect(mockReq.session.destroy).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    // Matches the actual controller string "Logout successful"
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Logout successful' });
  });
});