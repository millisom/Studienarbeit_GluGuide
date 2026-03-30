const User = require('../../models/authModel');
const UserModel = require('../../models/userModel'); 
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


      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM meals WHERE user_id = $1', [userId]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM glucose_logs WHERE user_id = $1', [userId]);
      expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [userId]);
      

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

 
      jest.spyOn(User, 'findUserByEmail').mockResolvedValue(null);
      const createSpy = jest.spyOn(User, 'createUser').mockResolvedValue({ id: 1 });

      await signUp(req, res);

  
      expect(createSpy).toHaveBeenCalledWith(
        'gdpr_user', 
        'gdpr@test.com', 
        'Password123!', 
        true, 
        true 
      );
      expect(res.json).toHaveBeenCalledWith("notexist");
    });
  });
});