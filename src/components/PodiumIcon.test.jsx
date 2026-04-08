import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PodiumIcon from './PodiumIcon';

describe('PodiumIcon', () => {
  it.each([
    [1, '🥇', 'text-yellow-400'],
    [2, '🥈', 'text-gray-400'],
    [3, '🥉', 'text-yellow-600'],
  ])('renders medal for rank %i', (rank, emoji, colorClass) => {
    const { container } = render(<PodiumIcon rank={rank} />);
    expect(screen.getByText(emoji)).toBeInTheDocument();
    const span = container.querySelector('span');
    expect(span).toHaveClass(colorClass);
    expect(span).toHaveClass('text-2xl', 'mr-2');
  });

  it('returns null for ranks outside 1-3', () => {
    const { container: out4 } = render(<PodiumIcon rank={4} />);
    expect(out4.firstChild).toBeNull();

    const { container: out0 } = render(<PodiumIcon rank={0} />);
    expect(out0.firstChild).toBeNull();
  });
});
