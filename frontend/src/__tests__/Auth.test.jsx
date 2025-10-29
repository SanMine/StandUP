import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Auth from '../pages/Auth';
import AuthContext from '../contexts/AuthContext';
import { MemoryRouter } from 'react-router-dom';

describe('Auth page - Sign In validation', () => {
  test('shows error when submitting empty email and password', async () => {
    const mockContext = {
      signin: jest.fn(),
      signup: jest.fn(),
      fetchMe: jest.fn()
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <MemoryRouter>
          <Auth />
        </MemoryRouter>
      </AuthContext.Provider>
    );

    // The Sign In button exists
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    // Click it without filling fields
    fireEvent.click(submitButton);

    // Expect the inline error to appear
    const error = await screen.findByText(/Email and password are required/i);
    expect(error).toBeInTheDocument();
    // Ensure signin was not called
    expect(mockContext.signin).not.toHaveBeenCalled();
  });
});
