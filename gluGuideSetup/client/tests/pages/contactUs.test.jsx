import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ContactUs from '../../src/pages/contactUs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
    i18n: { language: 'en' },
  }),
}));

describe('ContactUs Page', () => {
  it('renders title and subtitle', () => {
    render(<ContactUs />);
    expect(screen.getByText('contactUs.title')).toBeInTheDocument();
    expect(screen.getByText('contactUs.subtitle')).toBeInTheDocument();
  });

  it('renders name, email, message fields', () => {
    render(<ContactUs />);
    expect(screen.getByLabelText('contactUs.labelName')).toBeInTheDocument();
    expect(screen.getByLabelText('contactUs.labelEmail')).toBeInTheDocument();
    expect(screen.getByLabelText('contactUs.labelMessage')).toBeInTheDocument();
  });

  it('updates form inputs on change', () => {
    render(<ContactUs />);
    const name = screen.getByLabelText('contactUs.labelName');
    fireEvent.change(name, { target: { value: 'Alice' } });
    expect(name.value).toBe('Alice');
  });

  it('shows success message and resets fields on submit', async () => {
    const { container } = render(<ContactUs />);
    const form = container.querySelector('form');
    if (form) form.noValidate = true;

    const name = screen.getByLabelText('contactUs.labelName');
    const email = screen.getByLabelText('contactUs.labelEmail');
    const message = screen.getByLabelText('contactUs.labelMessage');

    fireEvent.change(name, { target: { value: 'Alice' } });
    fireEvent.change(email, { target: { value: 'a@example.com' } });
    fireEvent.change(message, { target: { value: 'Hi' } });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /contactUs\.btnSubmit/i }));
    });

    expect(screen.getByText('contactUs.success')).toBeInTheDocument();
    expect(name.value).toBe('');
    expect(email.value).toBe('');
    expect(message.value).toBe('');
  });

  it('renders direct contact info with email link', () => {
    render(<ContactUs />);
    const link = screen.getByText('gluguide01@gmail.com');
    expect(link).toHaveAttribute('href', 'mailto:gluguide01@gmail.com');
  });
});
