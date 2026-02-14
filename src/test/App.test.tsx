import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('App Layout', () => {
  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock AudioContext
    const mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
    };
    const mockGainNode = {
      connect: vi.fn(),
      gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    };
    const mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      state: 'running',
      resume: vi.fn(),
      close: vi.fn(),
    };
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: vi.fn(() => mockAudioContext),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows title "Pomodoro Timer" in header', () => {
    render(<App />);
    const header = document.querySelector('.app-header');
    expect(header).toBeInTheDocument();
    expect(screen.getByText('Pomodoro Timer')).toBeInTheDocument();
  });

  it('has header with proper structure', () => {
    render(<App />);
    const header = document.querySelector('.app-header');
    expect(header).toBeInTheDocument();
    
    const headerLeft = document.querySelector('.app-header__left');
    expect(headerLeft).toBeInTheDocument();
    
    const headerActions = document.querySelector('.app-header__actions');
    expect(headerActions).toBeInTheDocument();
  });

  it('settings button opens settings panel when clicked', async () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    });
  });

  it('settings panel shows correct title', async () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('timer display is centered in viewport', () => {
    render(<App />);
    const timerSection = document.querySelector('.app-timer-section');
    expect(timerSection).toBeInTheDocument();
    
    const mainContent = document.querySelector('.app-main');
    expect(mainContent).toBeInTheDocument();
    
    // Check that main has proper centering classes
    expect(mainContent).toHaveClass('app-main');
    expect(timerSection).toHaveClass('app-timer-section');
  });

  it('session counter is visible below timer', () => {
    render(<App />);
    const sessionSection = document.querySelector('.app-session-section');
    expect(sessionSection).toBeInTheDocument();
    
    const sessionCounter = screen.getByTestId('session-counter');
    expect(sessionCounter).toBeInTheDocument();
  });

  it('dark/light toggle is visible in header', () => {
    render(<App />);
    const headerActions = document.querySelector('.app-header__actions');
    expect(headerActions).toBeInTheDocument();
    
    const themeToggle = screen.getByTestId('theme-toggle');
    expect(themeToggle).toBeInTheDocument();
    expect(headerActions).toContainElement(themeToggle);
  });

  it('header contains both theme toggle and settings button', () => {
    render(<App />);
    const headerActions = document.querySelector('.app-header__actions');
    
    const themeToggle = screen.getByTestId('theme-toggle');
    const settingsButton = screen.getByTestId('settings-button');
    
    expect(headerActions).toContainElement(themeToggle);
    expect(headerActions).toContainElement(settingsButton);
  });

  it('settings button has proper accessibility attributes', () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    
    expect(settingsButton).toHaveAttribute('aria-label', 'Open settings');
    expect(settingsButton).toHaveAttribute('type', 'button');
  });

  it('main content area contains timer, controls, and session counter', () => {
    render(<App />);
    const mainContent = document.querySelector('.app-main');
    
    const timerSection = document.querySelector('.app-timer-section');
    const controlsSection = document.querySelector('.app-controls-section');
    const sessionSection = document.querySelector('.app-session-section');
    
    expect(mainContent).toContainElement(timerSection as HTMLElement);
    expect(mainContent).toContainElement(controlsSection as HTMLElement);
    expect(mainContent).toContainElement(sessionSection as HTMLElement);
  });

  it('footer shows keyboard shortcut hints', () => {
    render(<App />);
    const footer = document.querySelector('.app-footer');
    expect(footer).toBeInTheDocument();
    
    const hint = document.querySelector('.app-footer__hint');
    expect(hint).toBeInTheDocument();
    expect(hint?.textContent).toContain('Space');
    expect(hint?.textContent).toContain('R');
  });

  it('app container has proper layout structure', () => {
    render(<App />);
    const container = document.querySelector('.app-container');
    expect(container).toBeInTheDocument();
    
    const header = document.querySelector('.app-header');
    const main = document.querySelector('.app-main');
    const footer = document.querySelector('.app-footer');
    
    expect(container).toContainElement(header as HTMLElement);
    expect(container).toContainElement(main as HTMLElement);
    expect(container).toContainElement(footer as HTMLElement);
  });

  it('settings button is positioned in header actions', () => {
    render(<App />);
    const headerActions = document.querySelector('.app-header__actions');
    const settingsButton = screen.getByTestId('settings-button');
    
    expect(headerActions).toContainElement(settingsButton);
  });

  it('app has clean centered layout with proper spacing', () => {
    render(<App />);
    const mainContent = document.querySelector('.app-main');
    expect(mainContent).toBeInTheDocument();
    
    // Check that main has proper layout classes
    expect(mainContent).toHaveClass('app-main');
    expect(mainContent).toHaveClass('app-main');
  });
});

describe('App Layout - Settings Panel Integration', () => {
  beforeEach(() => {
    const localStorageMock = {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const mockOscillator = {
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      frequency: { value: 0 },
    };
    const mockGainNode = {
      connect: vi.fn(),
      gain: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    };
    const mockAudioContext = {
      createOscillator: vi.fn(() => mockOscillator),
      createGain: vi.fn(() => mockGainNode),
      destination: {},
      state: 'running',
      resume: vi.fn(),
      close: vi.fn(),
    };
    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: vi.fn(() => mockAudioContext),
    });
  });

  it('settings panel closes when clicking backdrop', async () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
    });
    
    const backdrop = document.querySelector('.settings-panel__backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
  });

  it('settings panel closes when clicking cancel button', async () => {
    render(<App />);
    const settingsButton = screen.getByTestId('settings-button');
    
    fireEvent.click(settingsButton);
    
    await waitFor(() => {
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
    
    const cancelButton = screen.getByTestId('settings-cancel');
    fireEvent.click(cancelButton);
  });
});
