const User = require('../../models/authModel');
const pool = require('../../config/db');
const argon2 = require('argon2');

jest.mock('../../config/db', () => ({
  query: jest.fn(),
}));

jest.mock('argon2');

describe('User Model', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user and return the inserted user with GDPR consent', async () => {
      const mockUser = { 
        username: 'hossay', 
        email: 'hossay@example.com', 
        terms_accepted: true,
        health_data_consent: true 
      };
      const hashedPassword = 'hashedPassword';
      const mockResult = { rows: [mockUser] };

      argon2.hash.mockResolvedValue(hashedPassword);
      pool.query.mockResolvedValue(mockResult);

      // We now pass TRUE for healthDataConsent as the 5th argument
      const result = await User.createUser('hossay', 'hossay@example.com', 'password123', true, true);

      expect(argon2.hash).toHaveBeenCalledWith('password123');
      
      // The query string must match the model exactly (including the NOW() function)
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users (username, email, password_hash, terms_accepted, health_data_consent, consent_timestamp)'),
        ['hossay', 'hossay@example.com', hashedPassword, true, true]
      );
      expect(result).toEqual(mockUser);
    });
  });

  // ... (findUserByEmail, getUserByUsername etc. remain the same as your previous file)
});