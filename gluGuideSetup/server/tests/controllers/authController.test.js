jest.mock('argon2', () => ({
  verify: jest.fn(),
  hash: jest.fn(),
}));

const authController = require('../../controllers/authController');
const User = require('../../models/authModel');
const argon2 = require('argon2');
const pool = require('../../config/db');
const { generateResetToken } = require('../../helpers/tokenHelper');
const NotificationContext = require('../../strategies/NotificationContext');


jest.mock('../../models/authModel');
jest.mock('../../config/db');
jest.mock('../../helpers/tokenHelper');
jest.mock('../../helpers/messageHelper');
jest.mock('../../strategies/NotificationContext');
jest.mock('../../strategies/EmailNotificationStrategy');

describe('Auth Controller', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      session: {
        save: jest.fn((cb) => cb()),
        destroy: jest.fn((cb) => cb()),
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      redirect: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
    };

    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  describe('signUp', () => {
    it('sollte "notexist" zurückgeben, wenn ein neuer User erstellt wird', async () => {
      req.body = { email: 'test@test.de', username: 'testuser', password: '123' };
      User.findUserByEmail.mockResolvedValue(null);
      User.createUser.mockResolvedValue(true);

      await authController.signUp(req, res);

      expect(res.json).toHaveBeenCalledWith("notexist");
      expect(User.createUser).toHaveBeenCalled();
    });

    it('sollte "exists" zurückgeben, wenn die Email bereits vergeben ist', async () => {
      req.body = { email: 'test@test.de' };
      User.findUserByEmail.mockResolvedValue({ id: 1 });

      await authController.signUp(req, res);

      expect(res.json).toHaveBeenCalledWith("exists");
    });
  });

  describe('loginUser', () => {
    it('sollte Login erfolgreich durchführen und Session speichern', async () => {
      req.body = { username: 'testuser', password: 'password123' };
      const mockUser = { id: 1, username: 'testuser', password_hash: 'hashed' };
      
      User.getUserByUsername.mockResolvedValue({ rows: [mockUser] });
      argon2.verify.mockResolvedValue(true);

      await authController.loginUser(req, res);

      expect(req.session.username).toBe('testuser');
      expect(req.session.userId).toBe(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ Login: true });
    });

    it('sollte Login ablehnen bei falschem Passwort', async () => {
      req.body = { username: 'testuser', password: 'wrong' };
      User.getUserByUsername.mockResolvedValue({ rows: [{ password_hash: 'hashed' }] });
      argon2.verify.mockResolvedValue(false);

      await authController.loginUser(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ Login: false }));
    });
  });

  describe('logout', () => {
    it('sollte Session zerstören und zum Root redirecten', async () => {
      await authController.logout(req, res);

      expect(req.session.destroy).toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('connect.sid', { path: '/' });
      expect(res.redirect).toHaveBeenCalledWith('/');
    });
  });

  describe('getStatus', () => {
    it('sollte valid: true zurückgeben, wenn Session aktiv ist', async () => {
      req.session.username = 'testuser';
      req.session.userId = 1;
      pool.query.mockResolvedValue({ rows: [{ is_admin: true }] });

      await authController.getStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        valid: true,
        username: 'testuser',
        userId: 1,
        is_admin: true
      });
    });

    it('sollte valid: false zurückgeben, wenn keine Session existiert', async () => {
      req.session = {}; // Keine Daten
      await authController.getStatus(req, res);
      expect(res.json).toHaveBeenCalledWith({ valid: false });
    });
  });

  describe('forgotPasswordRequest', () => {
    it('sollte Reset-Token generieren und Email senden', async () => {
      req.body = { email: 'test@test.de' };
      User.forgotPassword.mockResolvedValue({ rows: [{ email: 'test@test.de' }] });
      generateResetToken.mockReturnValue({ token: 'abc', expiry: '2026-01-01' });

      await authController.forgotPasswordRequest(req, res);

      expect(User.passwordToken).toHaveBeenCalledWith('abc', '2026-01-01', 'test@test.de');
      expect(NotificationContext.prototype.send).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sollte 404 zurückgeben, wenn User nicht existiert', async () => {
      req.body = { email: 'unbekannt@test.de' };
      User.forgotPassword.mockResolvedValue({ rows: [] });

      await authController.forgotPasswordRequest(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('passwordReset', () => {
    it('sollte Passwort erfolgreich aktualisieren', async () => {
      req.body = { token: 'valid-token', newPassword: 'new' };
      const futureDate = new Date(Date.now() + 10000);
      User.verifyResetToken.mockResolvedValue({ 
        rows: [{ username: 'testuser', password_reset_expires: futureDate }] 
      });
      argon2.hash.mockResolvedValue('new-hash');

      await authController.passwordReset(req, res);

      expect(User.updatePassword).toHaveBeenCalledWith('testuser', 'new-hash');
      expect(User.clearResetToken).toHaveBeenCalledWith('testuser');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('sollte Fehler werfen, wenn Token abgelaufen ist', async () => {
      req.body = { token: 'expired-token', newPassword: 'new' };
      const pastDate = new Date(Date.now() - 10000);
      User.verifyResetToken.mockResolvedValue({ 
        rows: [{ username: 'testuser', password_reset_expires: pastDate }] 
      });

      await authController.passwordReset(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Token expired' });
    });
  });
});