import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from '../../src/api/axiosConfig';
import SignUp from '../../src/pages/signUp';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../src/api/axiosConfig', () => ({
    default: {
        post: vi.fn()
    }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

describe('SignUp GDPR Compliance', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const fillForm = () => {
        fireEvent.change(screen.getByPlaceholderText(/Username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText(/^Password$/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText(/Confirm Password/i), { target: { value: 'Password123!' } });
    };

    it('blocks submission if Health Data Consent is not checked', async () => {
        const { container } = render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );

        fillForm();
        
        // Use a more specific selector for the checkboxes based on your HTML structure
        const termsCheckbox = screen.getByLabelText(/I accept the Terms & Conditions/i);
        fireEvent.click(termsCheckbox);

        // Target the form directly using the container to avoid "role" issues
        const form = container.querySelector('form');
        fireEvent.submit(form);

        expect(axios.post).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(alertMock).toHaveBeenCalledWith(
                expect.stringMatching(/Explicit consent for processing health data is required/i)
            );
        });
    });

    it('successfully submits when both GDPR checkboxes are checked', async () => {
        axios.post.mockResolvedValue({ data: 'notexist' });

        const { container } = render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );

        fillForm();

        const termsCheckbox = screen.getByLabelText(/I accept the Terms & Conditions/i);
        const healthCheckbox = screen.getByLabelText(/I explicitly consent to the processing of my health data/i);
        
        fireEvent.click(termsCheckbox);
        fireEvent.click(healthCheckbox);

        const form = container.querySelector('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/signUp', expect.objectContaining({
                username: 'testuser',
                termsAccepted: true,
                healthDataConsent: true
            }));
        });

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/', expect.anything());
        });
    });
});