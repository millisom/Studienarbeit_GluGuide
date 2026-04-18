import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginPage from '../../src/pages/login';

vi.mock('../../src/components/LoginForm', () => ({
  default: () => <div data-testid="login-form">LoginForm</div>,
}));

describe('Login Page', () => {
  it('renders the LoginForm component', () => {
    render(<LoginPage />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
});
