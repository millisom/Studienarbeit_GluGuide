const { generateResetToken } = require('../../helpers/tokenHelper');

describe('tokenHelper – generateResetToken', () => {
  it('returns an object with token and expiry', () => {
    const result = generateResetToken();
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('expiry');
  });

  it('token is a 40-character hex string', () => {
    const { token } = generateResetToken();
    expect(typeof token).toBe('string');
    expect(token).toMatch(/^[a-f0-9]{40}$/);
  });

  it('expiry is approximately 1 hour in the future', () => {
    const before = Date.now();
    const { expiry } = generateResetToken();
    const after = Date.now();
    const expiryMs = expiry.getTime();
    expect(expiryMs).toBeGreaterThanOrEqual(before + 3600000 - 100);
    expect(expiryMs).toBeLessThanOrEqual(after + 3600000 + 100);
  });

  it('generates different tokens on each call', () => {
    const { token: t1 } = generateResetToken();
    const { token: t2 } = generateResetToken();
    expect(t1).not.toBe(t2);
  });
});
