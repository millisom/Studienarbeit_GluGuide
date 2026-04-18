import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResetPassword from '../../src/pages/resetPassword';

vi.mock('../../src/components/ResetPasswordForm', () => ({
  default: () => <div data-testid="reset-form">ResetPasswordForm</div>,
}));

describe('ResetPassword Page', () => {
  it('renders the ResetPasswordForm component', () => {
    render(<ResetPassword />);
    expect(screen.getByTestId('reset-form')).toBeInTheDocument();
  });
});
