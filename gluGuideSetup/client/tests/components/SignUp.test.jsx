import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from '../../src/api/axiosConfig';
import SignUp from '../../src/pages/signUp';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key) => key,
        i18n: { language: 'en' }
    }),
    Trans: ({ children }) => children
}));

vi.mock('../../src/api/axiosConfig', () => ({
    default: { post: vi.fn() }
}));

const mockNavigate = vi.fn();
// Proper mock for react-router-dom to prevent unresolved promises
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { 
        ...actual, 
        useNavigate: () => mockNavigate,
        Link: ({ children, to }) => <a href={to}>{children}</a>
    };
});

describe('SignUp GDPR Compliance', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const fillForm = () => {
        fireEvent.change(screen.getByPlaceholderText('signUp.placeholderUsername'), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByPlaceholderText('signUp.placeholderEmail'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('signUp.placeholderPassword'), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByPlaceholderText('signUp.placeholderConfirmPassword'), { target: { value: 'Password123!' } });
    };

    it('blocks submission if Health Data Consent is not checked', async () => {
        const { container } = render(<BrowserRouter><SignUp /></BrowserRouter>);
        
        // Disable HTML5 validation to allow React to handle it
        const form = container.querySelector('form');
        if(form) form.noValidate = true;

        fillForm();
        
        const termsCheck = container.querySelector('input[name="termsAccepted"]');
        
        await act(async () => {
            fireEvent.click(termsCheck);
        });

        const submitBtn = screen.getByRole('button', { name: /signUp\.btnSubmit/i });
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        expect(axios.post).not.toHaveBeenCalled();
        await waitFor(() => expect(alertMock).toHaveBeenCalled());
    });

    it('successfully submits when both GDPR checkboxes are checked', async () => {
        // Return exactly what the component expects: "notexist" for successful signup
        axios.post.mockResolvedValue({ data: "notexist" });
        const { container } = render(<BrowserRouter><SignUp /></BrowserRouter>);
        
        const form = container.querySelector('form');
        if(form) form.noValidate = true;

        fillForm();

        const termsCheck = container.querySelector('input[name="termsAccepted"]');
        const healthCheck = container.querySelector('input[name="healthDataConsent"]');

        await act(async () => {
            fireEvent.click(termsCheck);
            fireEvent.click(healthCheck);
        });
        
        const submitBtn = screen.getByRole('button', { name: /signUp\.btnSubmit/i });
        
        await act(async () => {
            fireEvent.click(submitBtn);
        });

        expect(alertMock).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
        });

        // Wait for the navigation to happen after the successful post
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith("/", { state: { id: "test@example.com" } });
        });
    });
});