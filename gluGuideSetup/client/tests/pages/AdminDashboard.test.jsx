import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import AdminDashboard from '../../src/pages/AdminDashboard';
import axiosInstance from '../../src/api/axiosConfig';


vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="fa-icon" />
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../src/api/axiosConfig', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));


const tStable = (key) => key;
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: tStable,
    i18n: { language: 'de' }
  }),
}));

describe('AdminDashboard Component', () => {
  const mockUsers = [
    { id: 1, username: 'admin_user', email: 'admin@test.com', is_admin: true },
    { id: 2, username: 'normal_user', email: 'user@test.com', is_admin: false }
  ];

  const mockArticles = [
    { id: 10, title_de: 'Titel DE', title_en: 'Title EN', category_de: 'Kat DE', category_en: 'Cat EN' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    

    axiosInstance.get.mockImplementation((url) => {
      if (url === '/admin/users') return Promise.resolve({ data: mockUsers });
      if (url === '/admin/knowledge') return Promise.resolve({ data: mockArticles });
      return Promise.reject(new Error('not found'));
    });
    
    vi.spyOn(window, 'confirm').mockReturnValue(true);
  });

  const renderComponent = () => render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>
  );

  it('shows loading state initially', () => {
    axiosInstance.get.mockReturnValue(new Promise(() => {})); 
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders users and articles tables after loading', async () => {
    renderComponent();


    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });


    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.getByText('normal_user')).toBeInTheDocument();
    expect(screen.getByText('Titel DE')).toBeInTheDocument();
  });

  it('shows error message if fetch fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    axiosInstance.get.mockRejectedValue(new Error('Fetch failed'));

    renderComponent();

    const errorMsg = await screen.findByText(/errorGeneral/i);
    expect(errorMsg).toBeInTheDocument();
  });

  it('navigates to create user page on button click', async () => {
    renderComponent();
    

    const createBtn = await screen.findByText(/btnCreateUser/i);
    

    fireEvent.click(createBtn);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/createUser');
    });
  });

  it('handles user deletion after confirmation', async () => {
    axiosInstance.delete.mockResolvedValue({ data: { message: 'User deleted' } });
    renderComponent();
    
    const deleteButtons = await screen.findAllByText(/btnDelete/i);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/user/1');
    });
    
    expect(await screen.findByText('User deleted')).toBeInTheDocument();
  });

  it('handles article deletion correctly', async () => {
    axiosInstance.delete.mockResolvedValue({ data: { message: 'Success' } });
    renderComponent();
    
    const deleteButtons = await screen.findAllByText(/btnDelete/i);
    const lastBtn = deleteButtons[deleteButtons.length - 1]; 

    fireEvent.click(lastBtn);

    await waitFor(() => {
      expect(axiosInstance.delete).toHaveBeenCalledWith('/admin/knowledge/10');
    });
  });

  it('does NOT delete user if confirmation is cancelled', async () => {
    window.confirm.mockReturnValue(false);
    renderComponent();
    
    const deleteButtons = await screen.findAllByText(/btnDelete/i);
    fireEvent.click(deleteButtons[0]);

    expect(axiosInstance.delete).not.toHaveBeenCalled();
  });
});