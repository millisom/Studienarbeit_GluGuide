import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ProfileCard from '../../src/components/profileCard';
import { AuthContext } from '../../src/context/AuthContext';
import axiosInstance from '../../src/api/axiosConfig';



const stableT = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: stableT, i18n: { language: 'de' } }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('react-quill', () => ({
  default: ({ value, onChange }) => (
    <textarea data-testid="quill-mock" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

vi.mock('../../src/components/AlertForm', () => ({ default: () => <div data-testid="alert-form" /> }));
vi.mock('../../src/components/AlertsTable', () => ({ default: () => <div data-testid="alerts-table" /> }));
vi.mock('../../src/components/ExportReportModal', () => ({ default: ({ isOpen }) => isOpen ? <div data-testid="export-modal" /> : null }));

global.URL.createObjectURL = vi.fn(() => 'mock-preview-url');

describe('ProfileCard Component', () => {
  const mockUser = { username: 'testuser', id: 1 };
  const mockLogout = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    axiosInstance.get.mockImplementation((url) => {
      if (url === '/bio') return Promise.resolve({ data: { profile_bio: '<p>Old Bio</p>' } });
      if (url === '/dp') return Promise.resolve({ data: { url: 'http://image.com/avatar.jpg' } });
      return Promise.reject(new Error('Not Found'));
    });
  });

  const renderComponent = () => render(
    <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
      <MemoryRouter>
        <ProfileCard />
      </MemoryRouter>
    </AuthContext.Provider>
  );

  it('renders profile data correctly', async () => {
    renderComponent();
    expect(await screen.findByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('Old Bio')).toBeInTheDocument();
  });

  it('handles bio editing and saving', async () => {
    renderComponent();
    

    const bioHeader = await screen.findByText('profileCard.bioTitle');
    const bioEditBtn = bioHeader.parentElement.querySelector('button'); 
    fireEvent.click(bioEditBtn);

    const quill = screen.getByTestId('quill-mock');
    fireEvent.change(quill, { target: { value: 'New Bio' } });

    const saveBtn = screen.getByText('profileCard.btnSaveBio');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/setBio', { profile_bio: 'New Bio' });
    });
  });

  it('handles profile picture (DP) upload', async () => {
    const { container } = renderComponent();
    axiosInstance.post.mockResolvedValue({ data: { url: 'new-image.jpg' } });

    const dpImg = await screen.findByAltText('profileCard.ariaDp');
    const dpEditBtn = dpImg.parentElement.querySelector('button');
    fireEvent.click(dpEditBtn);

 
    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const fileInput = container.querySelector('input[type="file"]');
    
 
    fireEvent.change(fileInput, { target: { files: [file] } });
    

    const saveBtn = screen.getByText('profileCard.btnSave');
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/setDp', expect.any(FormData), expect.any(Object));
    });
  });

  it('handles account deletion with prompt', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('profileCard.accountDeleteKey');
    axiosInstance.post.mockResolvedValue({ status: 200 });
    
    renderComponent();
    
    const deleteBtn = await screen.findByText('profileCard.btnDeleteAccount');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith('/deleteAccount', { confirmDelete: 'testuser' });
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});