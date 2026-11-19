import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';

function ControlledSearchBar() {
  const [query, setQuery] = useState('Gabriel');
  return (
    <SearchBar
      value={query}
      onChange={setQuery}
      placeholder="Buscar por nome ou cargo..."
      ariaLabel="Buscar membros"
    />
  );
}

describe('SearchBar', () => {
  it('deve renderizar com role="search" e permitir digitação controlada', () => {
    const handleChange = vi.fn();
    render(
      <SearchBar
        value=""
        onChange={handleChange}
        placeholder="Buscar por nome ou cargo..."
        ariaLabel="Buscar membros"
      />,
    );

    expect(screen.getByRole('search')).toBeInTheDocument();
    const input = screen.getByLabelText('Buscar membros');
    expect(input).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: 'Ana' } });
    expect(handleChange).toHaveBeenCalledWith('Ana');
  });

  it('deve exibir botão de limpar quando houver texto e zerar o valor ao clicar', () => {
    render(<ControlledSearchBar />);

    const input = screen.getByLabelText('Buscar membros') as HTMLInputElement;
    expect(input.value).toBe('Gabriel');

    const clearButton = screen.getByRole('button', { name: 'Limpar busca' });
    fireEvent.click(clearButton);

    expect(input.value).toBe('');
    expect(screen.queryByRole('button', { name: 'Limpar busca' })).not.toBeInTheDocument();
  });
});
