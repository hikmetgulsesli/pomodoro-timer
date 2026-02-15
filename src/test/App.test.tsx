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
    const timerIcon = document.querySelector('svg');
    expect(timerIcon).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Ready to focus?')).toBeInTheDocument();
  });
});
