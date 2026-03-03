import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  describe('rendering', () => {
    it('should render in light-only mode (hidden)', () => {
      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('data-theme', 'light');
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
    });

    it('should have correct aria-label', () => {
      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('aria-label', 'Light mode');
    });

    it('should have button type', () => {
      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have aria-hidden on icon', () => {
      render(<ThemeToggle />);

      const icon = screen.getByTestId('sun-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
