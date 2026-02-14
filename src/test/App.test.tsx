import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Setup', () => {
  it('renders the app with correct title', () => {
    render(<App />);
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument();
  });

  it('renders with Lucide Timer icon', () => {
    render(<App />);
    const timerIcon = document.querySelector('.app-header__icon svg');
    expect(timerIcon).toBeInTheDocument();
  });

  it('renders the theme toggle button', () => {
    render(<App />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders the timer display', () => {
    render(<App />);
    expect(screen.getByTestId('timer-display')).toBeInTheDocument();
  });

  it('renders the timer controls', () => {
    render(<App />);
    expect(screen.getByTestId('timer-controls')).toBeInTheDocument();
  });

  it('renders the settings button', () => {
    render(<App />);
    expect(screen.getByTestId('settings-button')).toBeInTheDocument();
  });
});
