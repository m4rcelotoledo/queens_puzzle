import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppFooter from './AppFooter';

describe('AppFooter', () => {
  it('displays version from env with v prefix', () => {
    render(<AppFooter />);
    expect(screen.getByRole('contentinfo')).toHaveTextContent('v0.0.0-test');
  });

  it('applies overlay variant classes', () => {
    render(<AppFooter variant="overlay" />);
    const el = screen.getByRole('contentinfo');
    expect(el).toHaveClass('bg-black/70', 'text-gray-300');
  });
});
