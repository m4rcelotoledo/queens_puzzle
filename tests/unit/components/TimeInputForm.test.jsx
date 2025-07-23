import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeInputForm from '../../../src/components/TimeInputForm';

describe('TimeInputForm', () => {
  const defaultProps = {
    players: ['João', 'Maria', 'Pedro'],
    isSunday: false,
    times: {},
    handleTimeChange: jest.fn(),
    handleSaveScore: jest.fn(),
    setTimes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('deve renderizar campos para todos os jogadores', () => {
    render(<TimeInputForm {...defaultProps} />);

    expect(screen.getByText('João')).toBeInTheDocument();
    expect(screen.getByText('Maria')).toBeInTheDocument();
    expect(screen.getByText('Pedro')).toBeInTheDocument();
  });

  test('deve mostrar campos de tempo bônus apenas para domingos', () => {
    const { rerender } = render(<TimeInputForm {...defaultProps} />);

    // Sunday = false
    expect(screen.queryByText('Tempo Bônus (segundos)')).not.toBeInTheDocument();

    // Sunday = true
    rerender(<TimeInputForm {...defaultProps} isSunday={true} />);
    expect(screen.getAllByText('Tempo Bônus (segundos)')).toHaveLength(3);
  });

  test('deve chamar handleTimeChange quando tempo é alterado', () => {
    render(<TimeInputForm {...defaultProps} />);

    const timeInput = screen.getAllByPlaceholderText('Ex: 125')[0];
    fireEvent.change(timeInput, { target: { value: '120' } });

    expect(defaultProps.handleTimeChange).toHaveBeenCalledWith('João', 'time', '120');
  });

  test('deve chamar handleTimeChange quando tempo bônus é alterado', () => {
    render(<TimeInputForm {...defaultProps} isSunday={true} />);

    const bonusInputs = screen.getAllByPlaceholderText('Ex: 240');
    fireEvent.change(bonusInputs[0], { target: { value: '60' } });

    expect(defaultProps.handleTimeChange).toHaveBeenCalledWith('João', 'bonusTime', '60');
  });

  test('deve chamar handleSaveScore quando formulário é submetido', async () => {
    render(<TimeInputForm {...defaultProps} />);

    const form = document.querySelector('form');
    fireEvent.submit(form);

    expect(defaultProps.handleSaveScore).toHaveBeenCalled();
  });

  test('deve chamar setTimes quando botão limpar é clicado', async () => {
    const user = userEvent.setup();
    render(<TimeInputForm {...defaultProps} />);

    const clearButton = screen.getByText('Limpar');
    await user.click(clearButton);

    expect(defaultProps.setTimes).toHaveBeenCalledWith({});
  });

  test('deve exibir valores pré-preenchidos quando times não está vazio', () => {
    const timesWithValues = {
      'João': { time: 120, bonusTime: 0 },
      'Maria': { time: 150, bonusTime: 0 },
      'Pedro': { time: 180, bonusTime: 0 }
    };

    render(<TimeInputForm {...defaultProps} times={timesWithValues} />);

    const timeInputs = screen.getAllByDisplayValue('120');
    expect(timeInputs).toHaveLength(1);
  });

  test('deve exibir valores de tempo bônus quando é domingo', () => {
    const timesWithBonus = {
      'João': { time: 120, bonusTime: 60 },
      'Maria': { time: 150, bonusTime: 30 },
      'Pedro': { time: 180, bonusTime: 0 }
    };

    render(<TimeInputForm {...defaultProps} times={timesWithBonus} isSunday={true} />);

    expect(screen.getByDisplayValue('120')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
  });

  test('deve lidar com valores vazios corretamente', () => {
    const timesWithEmptyValues = {
      'João': { time: '', bonusTime: '' },
      'Maria': { time: '', bonusTime: '' },
      'Pedro': { time: '', bonusTime: '' }
    };

    render(<TimeInputForm {...defaultProps} times={timesWithEmptyValues} />);

    const timeInputs = screen.getAllByPlaceholderText('Ex: 125');
    expect(timeInputs).toHaveLength(3);
  });

  test('deve ter acessibilidade adequada', () => {
    render(<TimeInputForm {...defaultProps} />);

    // Check if the labels are associated with the inputs
    const labels = screen.getAllByText(/Tempo \(segundos\)/);
    expect(labels).toHaveLength(3);

    // Check if the inputs have the correct types
    const timeInputs = screen.getAllByRole('spinbutton');
    expect(timeInputs).toHaveLength(3);
  });

  test('deve ter botões com tipos corretos', () => {
    render(<TimeInputForm {...defaultProps} />);

    const submitButton = screen.getByText('Salvar');
    const clearButton = screen.getByText('Limpar');

    expect(submitButton).toHaveAttribute('type', 'submit');
    expect(clearButton).toHaveAttribute('type', 'button');
  });
});
