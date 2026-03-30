import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../app/page';

describe('Landing Page', () => {
    it('should render the Voca Auth hero title', () => {
        render(<LandingPage />);
        const titleElements = screen.getAllByRole('heading', { level: 1 });
        expect(titleElements.some(el => el.textContent?.includes('Voca Auth'))).toBeTruthy();
    });

    it('should contain a login and registration toggle', () => {
        render(<LandingPage />);
        expect(screen.getByText(/Sign In/i)).toBeInTheDocument();
        expect(screen.getByText(/Create Account/i)).toBeInTheDocument();
    });
});
