import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ForgotPassword from '../../src/pages/forgotPassword';

vi.mock('../../src/components/ForgotPasswordForm', () => ({
  default: () => <div data-testid="forgot-form">ForgotPasswordForm</div>,
}));

describe('ForgotPassword Page', () => {
  it('renders the ForgotPasswordForm component', () => {
    render(<ForgotPassword />);
    expect(screen.getByTestId('forgot-form')).toBeInTheDocument();
  });
});
