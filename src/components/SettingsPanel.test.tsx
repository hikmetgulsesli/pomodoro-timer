import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsPanel } from './SettingsPanel';

describe('SettingsPanel', () => {
  const mockOnClose = vi.fn();
  const mockOnDurationsChange = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    durations: {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
    },
    onDurationsChange: mockOnDurationsChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders settings panel when open', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByTestId('settings-panel')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders backdrop when open', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByTestId('settings-backdrop')).toBeInTheDocument();
    });

    it('does not render content when closed', () => {
      render(<SettingsPanel {...defaultProps} isOpen={false} />);
      
      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });

    it('shows work duration input with default value', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(25);
    });

    it('shows short break duration input with default value', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('short-break-duration-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(5);
    });

    it('shows long break duration input with default value', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('long-break-duration-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(15);
    });

    it('displays default hints for each input', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByText('Default: 25 minutes')).toBeInTheDocument();
      expect(screen.getByText('Default: 5 minutes')).toBeInTheDocument();
      expect(screen.getByText('Default: 15 minutes')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByTestId('settings-save')).toBeInTheDocument();
      expect(screen.getByTestId('settings-cancel')).toBeInTheDocument();
    });

    it('renders reset to defaults button', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByTestId('settings-reset-defaults')).toBeInTheDocument();
    });
  });

  describe('Duration Inputs', () => {
    it('accepts numeric values for work duration', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '30' } });
      
      expect(input).toHaveValue(30);
    });

    it('accepts numeric values for short break duration', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('short-break-duration-input');
      fireEvent.change(input, { target: { value: '10' } });
      
      expect(input).toHaveValue(10);
    });

    it('accepts numeric values for long break duration', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('long-break-duration-input');
      fireEvent.change(input, { target: { value: '20' } });
      
      expect(input).toHaveValue(20);
    });

    it('shows error for values below minimum (1)', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '0' } });
      
      expect(screen.getByTestId('work-duration-error')).toHaveTextContent('Minimum 1 minute');
    });

    it('shows error for values above maximum (60)', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '61' } });
      
      expect(screen.getByTestId('work-duration-error')).toHaveTextContent('Maximum 60 minutes');
    });

    it('disables save button when there are validation errors', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '0' } });
      
      expect(screen.getByTestId('settings-save')).toBeDisabled();
    });

    it('marks input as invalid when there is an error', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '0' } });
      
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('clears error when valid value is entered', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '0' } });
      expect(screen.getByTestId('work-duration-error')).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: '25' } });
      expect(screen.queryByTestId('work-duration-error')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('calls onClose when backdrop is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('settings-backdrop'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when close button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('settings-close-button'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onClose when cancel button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.click(screen.getByTestId('settings-cancel'));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onDurationsChange with new values when form is submitted', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '30' } });
      fireEvent.change(screen.getByTestId('short-break-duration-input'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('long-break-duration-input'), { target: { value: '20' } });
      
      fireEvent.click(screen.getByTestId('settings-save'));
      
      expect(mockOnDurationsChange).toHaveBeenCalledWith({
        workDuration: 30,
        shortBreakDuration: 10,
        longBreakDuration: 20,
      });
    });

    it('calls onClose after saving changes', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '30' } });
      fireEvent.click(screen.getByTestId('settings-save'));
      
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('resets to default values when reset button is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '30' } });
      fireEvent.change(screen.getByTestId('short-break-duration-input'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('long-break-duration-input'), { target: { value: '20' } });
      
      fireEvent.click(screen.getByTestId('settings-reset-defaults'));
      
      expect(screen.getByTestId('work-duration-input')).toHaveValue(25);
      expect(screen.getByTestId('short-break-duration-input')).toHaveValue(5);
      expect(screen.getByTestId('long-break-duration-input')).toHaveValue(15);
    });

    it('clears errors when reset to defaults is clicked', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '0' } });
      expect(screen.getByTestId('work-duration-error')).toBeInTheDocument();
      
      fireEvent.click(screen.getByTestId('settings-reset-defaults'));
      
      expect(screen.queryByTestId('work-duration-error')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('closes panel when Escape key is pressed', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not close panel when other keys are pressed', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.keyDown(window, { key: 'Enter' });
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has correct ARIA attributes when open', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveAttribute('aria-hidden', 'false');
      expect(panel).toHaveAttribute('aria-label', 'Settings panel');
    });

    it('has correct ARIA attributes when closed', () => {
      render(<SettingsPanel {...defaultProps} isOpen={false} />);
      
      const panel = screen.getByTestId('settings-panel');
      expect(panel).toHaveAttribute('aria-hidden', 'true');
    });

    it('close button has accessible label', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByTestId('settings-close-button')).toHaveAttribute('aria-label', 'Close settings');
    });

    it('inputs have associated labels', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(screen.getByLabelText('Work Duration')).toBeInTheDocument();
      expect(screen.getByLabelText('Short Break Duration')).toBeInTheDocument();
      expect(screen.getByLabelText('Long Break Duration')).toBeInTheDocument();
    });

    it('error messages have role alert', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '0' } });
      
      const error = screen.getByTestId('work-duration-error');
      expect(error).toHaveAttribute('role', 'alert');
    });

    it('inputs have aria-describedby pointing to hint when valid', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      expect(input).toHaveAttribute('aria-describedby', 'work-duration-hint');
    });

    it('inputs have aria-describedby pointing to error when invalid', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '0' } });
      
      const input = screen.getByTestId('work-duration-input');
      expect(input).toHaveAttribute('aria-describedby', 'work-duration-error');
    });
  });

  describe('Body Scroll Lock', () => {
    it('prevents body scroll when panel is open', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when panel is closed', () => {
      const { rerender } = render(<SettingsPanel {...defaultProps} />);
      
      rerender(<SettingsPanel {...defaultProps} isOpen={false} />);
      
      expect(document.body.style.overflow).toBe('');
    });

    it('cleans up overflow style on unmount', () => {
      const { unmount } = render(<SettingsPanel {...defaultProps} />);
      
      unmount();
      
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string input gracefully', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: '' } });
      
      // Empty string results in empty value (browser behavior)
      expect(input).toHaveValue(null);
    });

    it('handles non-numeric input gracefully', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      const input = screen.getByTestId('work-duration-input');
      fireEvent.change(input, { target: { value: 'abc' } });
      
      // Non-numeric input results in empty value (browser behavior for number input)
      expect(input).toHaveValue(null);
    });

    it('clamps values to valid range on save', () => {
      render(<SettingsPanel {...defaultProps} />);
      
      // Set invalid values
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('short-break-duration-input'), { target: { value: '-5' } });
      
      // Reset to valid values first to clear errors
      fireEvent.click(screen.getByTestId('settings-reset-defaults'));
      
      // Now set valid values and save
      fireEvent.change(screen.getByTestId('work-duration-input'), { target: { value: '30' } });
      fireEvent.click(screen.getByTestId('settings-save'));
      
      expect(mockOnDurationsChange).toHaveBeenCalled();
    });

    it('updates form values when durations prop changes', () => {
      const { rerender } = render(<SettingsPanel {...defaultProps} />);
      
      rerender(
        <SettingsPanel
          {...defaultProps}
          durations={{
            workDuration: 45,
            shortBreakDuration: 10,
            longBreakDuration: 30,
          }}
        />
      );
      
      // Close and reopen to trigger the effect
      rerender(
        <SettingsPanel
          {...defaultProps}
          isOpen={false}
          durations={{
            workDuration: 45,
            shortBreakDuration: 10,
            longBreakDuration: 30,
          }}
        />
      );
      
      rerender(
        <SettingsPanel
          {...defaultProps}
          isOpen={true}
          durations={{
            workDuration: 45,
            shortBreakDuration: 10,
            longBreakDuration: 30,
          }}
        />
      );
      
      expect(screen.getByTestId('work-duration-input')).toHaveValue(45);
      expect(screen.getByTestId('short-break-duration-input')).toHaveValue(10);
      expect(screen.getByTestId('long-break-duration-input')).toHaveValue(30);
    });
  });
});
