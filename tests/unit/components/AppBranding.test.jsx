import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AppBranding from '../../../src/components/AppBranding';

describe('AppBranding', () => {
  it('renders title and tagline', () => {
    render(<AppBranding />);

    expect(screen.getByRole('heading', { level: 1, name: /placar do puzzle/i })).toBeInTheDocument();
    expect(screen.getByText(/acompanhe os mestres do tabuleiro/i)).toBeInTheDocument();
  });
});
