/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation for useSearchParams
jest.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Firebase client to avoid initialization errors in test
jest.mock('@/lib/firebase-client', () => ({
  auth: undefined,
}));

// Mock firebase/auth to prevent fetch-related errors at import time
jest.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
}));

import LandingPage from '../app/page';

describe('Landing Page', () => {
  it('should render the Voca Auth hero title', () => {
    render(<LandingPage />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent(/Voca/i);
    expect(heading).toHaveTextContent(/Auth/i);
  });

  it('should contain a login and registration toggle', () => {
    render(<LandingPage />);
    // Tab triggers contain these labels
    const signInElements = screen.getAllByText(/Sign In/i);
    expect(signInElements.length).toBeGreaterThanOrEqual(1);
    const createAccountElements = screen.getAllByText(/Create Account/i);
    expect(createAccountElements.length).toBeGreaterThanOrEqual(1);
  });
});
