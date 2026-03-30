const User = require('../../models/authModel');
const UserModel = require('../../models/userModel'); // For the delete logic
const pool = require('../../config/db');
const { signUp } = require('../../controllers/authController');

jest.mock('../../config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

describe('GDPR Compliance Use Cases', () => {
  
  describe('Right to Erasure (Cascading Deletion)', () => {
    it('should clean up all related health data when a user is deleted', async () => {
      const userId = 99;
      const mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };
      pool.connect.mockResolvedValue(mockClient);

      await UserModel.deleteUserById(userId);

      // Check if delete queries were called for health data tables
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM meals WHERE user_id = $1', [userId]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM glucose_logs WHERE user_id = $1', [userId]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [userId]);
      
      // Ensure transaction was committed
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });
  });

  describe('Consent Logging Integrity', () => {
    it('should include health_data_consent in the signup process', async () => {
      const req = {
        body: {
          username: 'gdpr_user',
          email: 'gdpr@test.com',
          password: 'Password123!',
          termsAccepted: true,
          healthDataConsent: true
        }
      };
      const res = { json: jest.fn(), status: jest.fn().mockReturnThis() };

      // Mock User.findUserByEmail to return null (user doesn't exist)
      jest.spyOn(User, 'findUserByEmail').mockResolvedValue(null);
      const createSpy = jest.spyOn(User, 'createUser').mockResolvedValue({ id: 1 });

      await signUp(req, res);

      // Verify that the controller passed the healthDataConsent to the Model
      expect(createSpy).toHaveBeenCalledWith(
        'gdpr_user', 
        'gdpr@test.com', 
        'Password123!', 
        true, 
        true // This is the healthDataConsent
      );
      expect(res.json).toHaveBeenCalledWith("notexist");
    });
  });
});