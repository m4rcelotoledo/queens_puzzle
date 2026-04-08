import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppBranding from './AppBranding';

describe('AppBranding', () => {
  it('renders title and tagline', () => {
    render(<AppBranding />);

    expect(screen.getByRole('heading', { level: 1, name: /placar do puzzle/i })).toBeInTheDocument();
    expect(screen.getByText(/acompanhe os mestres do tabuleiro/i)).toBeInTheDocument();
  });

  it('applies compact title classes when compactTitle is true', () => {
    render(<AppBranding compactTitle />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('whitespace-nowrap');
    expect(h1).toHaveClass('text-2xl');
  });

  it('centers block when centered is true', () => {
    const { container } = render(<AppBranding compactTitle centered />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('text-center');
  });
});
