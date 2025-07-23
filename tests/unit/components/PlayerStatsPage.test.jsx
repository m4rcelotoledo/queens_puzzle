import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlayerStatsPage from '../../../src/components/PlayerStatsPage';

// Recharts mock
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

describe('PlayerStatsPage', () => {
  const mockStats = {
    name: 'João Silva',
    wins: 5,
    podiums: 12,
    bestTime: 95,
    avgTime: '120',
    timeHistory: [
      { date: '01/01', time: 120 },
      { date: '02/01', time: 110 },
      { date: '03/01', time: 95 },
      { date: '04/01', time: 130 }
    ]
  };

  const defaultProps = {
    stats: mockStats,
    onBack: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar estatísticas do jogador corretamente', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    expect(screen.getByText('João Silva - Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument(); // Wins
    expect(screen.getByText('12')).toBeInTheDocument(); // Podiums
    expect(screen.getByText('95')).toBeInTheDocument(); // Best time
    expect(screen.getByText('120')).toBeInTheDocument(); // Average time
  });

  test('deve exibir unidades corretas para cada estatística', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    expect(screen.getByText('Vitórias (🥇)')).toBeInTheDocument();
    expect(screen.getByText('Pódios')).toBeInTheDocument();
    expect(screen.getByText('Melhor Tempo')).toBeInTheDocument();
    expect(screen.getByText('Tempo Médio')).toBeInTheDocument();

    // Check the units
    const units = screen.getAllByText('dias');
    expect(units).toHaveLength(2); // Wins and Podiums

    const timeUnits = screen.getAllByText('seg');
    expect(timeUnits).toHaveLength(2); // Best time and average time
  });

  test('deve renderizar gráfico de evolução', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    expect(screen.getByText('Evolução do Tempo')).toBeInTheDocument();
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });

  test('deve chamar onBack quando botão voltar é clicado', async () => {
    const user = userEvent.setup();
    render(<PlayerStatsPage {...defaultProps} />);

    const backButton = screen.getByText('← Voltar');
    await user.click(backButton);

    expect(defaultProps.onBack).toHaveBeenCalledTimes(1);
  });

    test('deve lidar com estatísticas vazias', () => {
    const emptyStats = {
      name: 'João Silva',
      wins: 0,
      podiums: 0,
      bestTime: 'N/A',
      avgTime: 'N/A',
      timeHistory: []
    };

    render(<PlayerStatsPage {...defaultProps} stats={emptyStats} />);

    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2); // Wins and Podiums
    expect(screen.getAllByText('N/A')).toHaveLength(2); // Best time and average time
  });

  test('deve lidar com tempo médio como string', () => {
    const statsWithStringAvg = {
      ...mockStats,
      avgTime: '115.5'
    };

    render(<PlayerStatsPage {...defaultProps} stats={statsWithStringAvg} />);

    expect(screen.getByText('115.5')).toBeInTheDocument();
  });

  test('deve renderizar botão voltar com estilo correto', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    const backButton = screen.getByText('← Voltar');
    expect(backButton).toHaveClass('bg-gray-200');
  });

        test('deve ter estrutura de layout correta', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    // Check if the main container exists
    const container = screen.getByText('João Silva - Estatísticas').closest('div');
    expect(container).toBeInTheDocument();
  });

  test('deve exibir histórico de tempos no gráfico', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    // Check if the chart is present
    expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('x-axis')).toBeInTheDocument();
    expect(screen.getByTestId('y-axis')).toBeInTheDocument();
  });

  test('deve lidar com stats null', () => {
    render(<PlayerStatsPage {...defaultProps} stats={null} />);

    // The component should not render anything when stats is null
    expect(screen.queryByText('João Silva - Estatísticas')).not.toBeInTheDocument();
  });

  test('deve ter acessibilidade adequada', () => {
    render(<PlayerStatsPage {...defaultProps} />);

    // Check if the back button has the correct role
    const backButton = screen.getByRole('button', { name: /voltar/i });
    expect(backButton).toBeInTheDocument();

    // Check if the headings are correct
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  test('deve exibir estatísticas com valores corretos', () => {
    const statsWithHighValues = {
      name: 'Maria Santos',
      wins: 15,
      podiums: 25,
      bestTime: 85,
      avgTime: '110',
      timeHistory: []
    };

    render(<PlayerStatsPage {...defaultProps} stats={statsWithHighValues} />);

    expect(screen.getByText('Maria Santos - Estatísticas')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument(); // Wins
    expect(screen.getByText('25')).toBeInTheDocument(); // Podiums
    expect(screen.getByText('85')).toBeInTheDocument(); // Best time
    expect(screen.getByText('110')).toBeInTheDocument(); // Average time
  });
});
