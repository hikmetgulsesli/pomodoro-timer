import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TimerDisplay } from './TimerDisplay';

describe('TimerDisplay', () => {
  it('renders time in MM:SS format', () => {
    render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    const timeElement = screen.getByTestId('timer-time');
    expect(timeElement).toHaveTextContent('25:00');
  });

  it('formats single digit minutes and seconds correctly', () => {
    render(
      <TimerDisplay timeRemaining={65} totalTime={300} mode="work" />
    );
    
    const timeElement = screen.getByTestId('timer-time');
    expect(timeElement).toHaveTextContent('01:05');
  });

  it('formats zero correctly', () => {
    render(
      <TimerDisplay timeRemaining={0} totalTime={300} mode="work" />
    );
    
    const timeElement = screen.getByTestId('timer-time');
    expect(timeElement).toHaveTextContent('00:00');
  });

  it('displays Work mode label', () => {
    render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveTextContent('Work');
  });

  it('displays Short Break mode label', () => {
    render(
      <TimerDisplay timeRemaining={300} totalTime={300} mode="shortBreak" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveTextContent('Short Break');
  });

  it('displays Long Break mode label', () => {
    render(
      <TimerDisplay timeRemaining={900} totalTime={900} mode="longBreak" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveTextContent('Long Break');
  });

  it('renders the circular progress ring', () => {
    render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    const ringElement = screen.getByTestId('timer-ring');
    expect(ringElement).toBeInTheDocument();
  });

  it('renders the progress ring with correct stroke-dasharray', () => {
    render(
      <TimerDisplay timeRemaining={750} totalTime={1500} mode="work" />
    );
    
    const progressRing = screen.getByTestId('timer-ring-progress');
    expect(progressRing).toBeInTheDocument();
  });

  it('uses correct color for work mode', () => {
    render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveStyle({ color: 'var(--timer-work)' });
  });

  it('uses correct color for short break mode', () => {
    render(
      <TimerDisplay timeRemaining={300} totalTime={300} mode="shortBreak" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveStyle({ color: 'var(--timer-break)' });
  });

  it('uses correct color for long break mode', () => {
    render(
      <TimerDisplay timeRemaining={900} totalTime={900} mode="longBreak" />
    );
    
    const modeElement = screen.getByTestId('timer-mode');
    expect(modeElement).toHaveStyle({ color: 'var(--timer-long-break)' });
  });

  it('has smooth transition on progress ring', () => {
    render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    const progressRing = screen.getByTestId('timer-ring-progress');
    expect(progressRing).toHaveStyle({
      transition: 'stroke-dashoffset 300ms ease, stroke 300ms ease',
    });
  });

  it('accepts timeRemaining, totalTime, and mode as props', () => {
    const { rerender } = render(
      <TimerDisplay timeRemaining={1500} totalTime={1500} mode="work" />
    );
    
    expect(screen.getByTestId('timer-time')).toHaveTextContent('25:00');
    expect(screen.getByTestId('timer-mode')).toHaveTextContent('Work');
    
    rerender(<TimerDisplay timeRemaining={300} totalTime={300} mode="shortBreak" />);
    
    expect(screen.getByTestId('timer-time')).toHaveTextContent('05:00');
    expect(screen.getByTestId('timer-mode')).toHaveTextContent('Short Break');
  });
});
