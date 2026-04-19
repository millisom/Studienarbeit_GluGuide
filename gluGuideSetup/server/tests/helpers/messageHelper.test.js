const { createPasswordResetMessage } = require('../../helpers/messageHelper');

describe('messageHelper – createPasswordResetMessage', () => {
  const link = 'https://example.com/reset/abc123';

  it('returns an object with subject and message', () => {
    const result = createPasswordResetMessage(link);
    expect(result).toHaveProperty('subject');
    expect(result).toHaveProperty('message');
  });

  it('subject is "Password Reset Request"', () => {
    const { subject } = createPasswordResetMessage(link);
    expect(subject).toBe('Password Reset Request');
  });

  it('message contains the provided reset link', () => {
    const { message } = createPasswordResetMessage(link);
    expect(message).toContain(link);
  });

  it('message contains instructions to ignore if not requested', () => {
    const { message } = createPasswordResetMessage(link);
    expect(message).toContain('If you did not request this');
  });

  it('message contains instruction to paste link in browser', () => {
    const { message } = createPasswordResetMessage(link);
    expect(message).toContain('paste this into your browser');
  });
});
