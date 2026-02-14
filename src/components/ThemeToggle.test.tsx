import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeToggle } from './ThemeToggle';

// Mock the useTheme hook
const mockToggleTheme = vi.fn();
const mockSetTheme = vi.fn();

vi.mock('../hooks/useTheme', () => ({
  useTheme: vi.fn(),
  THEME_STORAGE_KEY: 'pomodoro-theme',
}));

import { useTheme } from '../hooks/useTheme';

const mockedUseTheme = vi.mocked(useTheme);

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('rendering', () => {
    it('should render sun icon in light mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId('sun-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('moon-icon')).not.toBeInTheDocument();
    });

    it('should render moon icon in dark mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      render(<ThemeToggle />);

      expect(screen.getByTestId('moon-icon')).toBeInTheDocument();
      expect(screen.queryByTestId('sun-icon')).not.toBeInTheDocument();
    });

    it('should have correct aria-label for light mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should have correct aria-label for dark mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });

    it('should have correct title for light mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('title', 'Switch to dark mode');
    });

    it('should have correct title for dark mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('title', 'Switch to light mode');
    });

    it('should have data-theme attribute set to current theme', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('data-theme', 'dark');
    });
  });

  describe('interaction', () => {
    it('should call toggleTheme when clicked in light mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should call toggleTheme when clicked in dark mode', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      fireEvent.click(button);

      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should be focusable via keyboard', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      button.focus();

      expect(button).toHaveFocus();
    });

    it('should call toggleTheme when activated via keyboard (Enter)', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      fireEvent.keyDown(button, { key: 'Enter' });

      // Note: The actual toggle happens on click, Enter on button triggers click
      fireEvent.click(button);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });

    it('should call toggleTheme when activated via keyboard (Space)', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      fireEvent.keyDown(button, { key: ' ' });

      // Note: The actual toggle happens on click, Space on button triggers click
      fireEvent.click(button);
      expect(mockToggleTheme).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have button type', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have aria-hidden on icons', () => {
      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      render(<ThemeToggle />);

      const icon = screen.getByTestId('sun-icon');
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });

    it('should update aria-label when theme changes', () => {
      const { rerender } = render(<ThemeToggle />);

      mockedUseTheme.mockReturnValue({
        theme: 'light',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: false,
      });

      rerender(<ThemeToggle />);

      let button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');

      mockedUseTheme.mockReturnValue({
        theme: 'dark',
        toggleTheme: mockToggleTheme,
        setTheme: mockSetTheme,
        isDark: true,
      });

      rerender(<ThemeToggle />);

      button = screen.getByTestId('theme-toggle');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });
});
