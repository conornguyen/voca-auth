/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// ─── Mocks ──────────────────────────────────────────────────────

const mockSignIn = jest.fn();
const mockCreateUser = jest.fn();

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: (...args: unknown[]) => mockSignIn(...args),
  createUserWithEmailAndPassword: (...args: unknown[]) => mockCreateUser(...args),
}));

jest.mock('@/lib/firebase-client', () => ({
  auth: { currentUser: null }, // truthy so the form doesn't bail early
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// ─── Import after mocks ────────────────────────────────────────

import AuthForms from '../app/AuthForms';

// ─── Tests ──────────────────────────────────────────────────────

describe('AuthForms - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation errors when submitting empty login form', async () => {
    render(<AuthForms />);

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('should call signInWithEmailAndPassword on valid login submission', async () => {
    const mockIdToken = 'mock-firebase-id-token';
    mockSignIn.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve(mockIdToken) },
    });

    // Mock the session endpoint
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<AuthForms />);

    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'test@voca.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    const submitButton = screen.getByRole('button', { name: /Sign In/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledTimes(1);
    });
  });
});

describe('AuthForms - Register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show validation errors when submitting empty register form', async () => {
    render(<AuthForms />);

    // Switch to register tab
    const registerTab = screen.getByRole('tab', { name: /Create Account/i });
    fireEvent.click(registerTab);

    await waitFor(() => {
      const submitButton = screen.getByRole('button', { name: /Create Account/i });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('should call createUserWithEmailAndPassword on valid register submission', async () => {
    const mockIdToken = 'mock-firebase-id-token-register';
    mockCreateUser.mockResolvedValue({
      user: { getIdToken: () => Promise.resolve(mockIdToken) },
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    render(<AuthForms />);

    // Switch to register tab
    const registerTab = screen.getByRole('tab', { name: /Create Account/i });
    fireEvent.click(registerTab);

    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'Jane Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'jane@voca.com' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'securePass1' },
    });

    const submitButton = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledTimes(1);
    });
  });
});
