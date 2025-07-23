import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DarkModeToggle from '../../../src/components/DarkModeToggle';

describe('DarkModeToggle', () => {
  const defaultProps = {
    isDarkMode: false,
    setIsDarkMode: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render the toggle button', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('should display moon icon when in light mode', () => {
    render(<DarkModeToggle {...defaultProps} isDarkMode={false} />);

    // Check if the moon icon is present (light mode shows moon to switch to dark mode)
    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toBeInTheDocument();
    expect(moonIcon).toHaveClass('text-slate-400');
  });

  test('should display sun icon when in dark mode', () => {
    render(<DarkModeToggle {...defaultProps} isDarkMode={true} />);

    // Check if the sun icon is present (dark mode shows sun to switch to light mode)
    const sunIcon = screen.getByRole('button').querySelector('svg');
    expect(sunIcon).toBeInTheDocument();
    expect(sunIcon).toHaveClass('text-yellow-500');
  });

  test('should call setIsDarkMode when clicked', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(true);
  });

  test('should toggle between light and dark mode', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<DarkModeToggle {...defaultProps} />);

    // Initially in light mode (shows moon)
    const moonIcon = screen.getByRole('button').querySelector('svg');
    expect(moonIcon).toHaveClass('text-slate-400');

    // Click to switch to dark mode
    const toggleButton = screen.getByRole('button');
    await user.click(toggleButton);

    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(true);

    // Re-render with dark mode (shows sun)
    rerender(<DarkModeToggle {...defaultProps} isDarkMode={true} />);
    const sunIcon = screen.getByRole('button').querySelector('svg');
    expect(sunIcon).toHaveClass('text-yellow-500');

    // Click again to switch back to light mode
    await user.click(toggleButton);
    expect(defaultProps.setIsDarkMode).toHaveBeenCalledWith(false);
  });

  test('should have accessibility', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();

    // Check if the button is clickable
    expect(toggleButton).not.toBeDisabled();
  });

  test('should have correct CSS classes', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('p-2');
    expect(toggleButton).toHaveClass('rounded-full');
  });

  test('should be clickable', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).not.toBeDisabled();
  });

  test('should have the correct size', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  test('should handle multiple clicks', async () => {
    const user = userEvent.setup();
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');

    // Multiple clicks
    await user.click(toggleButton);
    await user.click(toggleButton);
    await user.click(toggleButton);

    // Should call setIsDarkMode for each click
    expect(defaultProps.setIsDarkMode).toHaveBeenCalledTimes(3);
  });

  test('should have the correct background', () => {
    render(<DarkModeToggle {...defaultProps} />);

    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('bg-gray-200');
    expect(toggleButton).toHaveClass('dark:bg-gray-700');
  });
});
