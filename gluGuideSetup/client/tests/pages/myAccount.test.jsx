import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MyAccount from '../../src/pages/myAccount';

vi.mock('../../src/components/profileCard', () => ({
  default: () => <div data-testid="profile-card">ProfileCard</div>,
}));

describe('MyAccount Page', () => {
  it('renders the ProfileCard component', () => {
    render(<MyAccount />);
    expect(screen.getByTestId('profile-card')).toBeInTheDocument();
  });
});
