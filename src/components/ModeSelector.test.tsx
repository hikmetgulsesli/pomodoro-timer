import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeSelector } from './ModeSelector';
import type { TimerMode } from '../hooks/useTimer';

describe('ModeSelector', () => {
  const defaultProps = {
    currentMode: 'work' as TimerMode,
    onModeChange: vi.fn(),
    disabled: false,
  };

  it('renders all three mode buttons', () => {
    render(<ModeSelector {...defaultProps} />);
    
    expect(screen.getByTestId('mode-button-work')).toBeInTheDocument();
    expect(screen.getByTestId('mode-button-shortBreak')).toBeInTheDocument();
    expect(screen.getByTestId('mode-button-longBreak')).toBeInTheDocument();
  });

  it('displays correct labels and durations', () => {
    render(<ModeSelector {...defaultProps} />);
    
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('25 min')).toBeInTheDocument();
    expect(screen.getByText('Short Break')).toBeInTheDocument();
    expect(screen.getByText('5 min')).toBeInTheDocument();
    expect(screen.getByText('Long Break')).toBeInTheDocument();
    expect(screen.getByText('15 min')).toBeInTheDocument();
  });

  it('marks current mode as active', () => {
    render(<ModeSelector {...defaultProps} currentMode="work" />);
    
    const workButton = screen.getByTestId('mode-button-work');
    expect(workButton).toHaveClass('mode-selector__button--active');
    expect(workButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onModeChange when clicking a different mode', () => {
    const onModeChange = vi.fn();
    render(<ModeSelector {...defaultProps} onModeChange={onModeChange} />);
    
    fireEvent.click(screen.getByTestId('mode-button-shortBreak'));
    
    expect(onModeChange).toHaveBeenCalledWith('shortBreak');
  });

  it('does not call onModeChange when clicking current mode', () => {
    const onModeChange = vi.fn();
    render(<ModeSelector {...defaultProps} currentMode="work" onModeChange={onModeChange} />);
    
    fireEvent.click(screen.getByTestId('mode-button-work'));
    
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('disables buttons when disabled prop is true', () => {
    render(<ModeSelector {...defaultProps} disabled={true} />);
    
    expect(screen.getByTestId('mode-button-work')).toBeDisabled();
    expect(screen.getByTestId('mode-button-shortBreak')).toBeDisabled();
    expect(screen.getByTestId('mode-button-longBreak')).toBeDisabled();
  });

  it('does not call onModeChange when disabled', () => {
    const onModeChange = vi.fn();
    render(<ModeSelector {...defaultProps} disabled={true} onModeChange={onModeChange} />);
    
    fireEvent.click(screen.getByTestId('mode-button-shortBreak'));
    
    expect(onModeChange).not.toHaveBeenCalled();
  });

  it('updates active state when mode changes', () => {
    const { rerender } = render(<ModeSelector {...defaultProps} currentMode="work" />);
    
    expect(screen.getByTestId('mode-button-work')).toHaveClass('mode-selector__button--active');
    
    rerender(<ModeSelector {...defaultProps} currentMode="shortBreak" />);
    
    expect(screen.getByTestId('mode-button-shortBreak')).toHaveClass('mode-selector__button--active');
    expect(screen.getByTestId('mode-button-work')).not.toHaveClass('mode-selector__button--active');
  });

  it('renders with correct data-testid', () => {
    render(<ModeSelector {...defaultProps} />);
    
    expect(screen.getByTestId('mode-selector')).toBeInTheDocument();
  });
});
