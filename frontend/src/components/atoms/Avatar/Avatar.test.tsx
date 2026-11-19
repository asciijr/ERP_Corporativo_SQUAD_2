import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('deve exibir as iniciais do nome quando avatarUrl não for informado', () => {
    render(<Avatar name="Beatriz Costa" />);
    const avatar = screen.getByRole('img', { name: 'Avatar de Beatriz Costa' });
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('BC');
  });

  it('deve aplicar a mesma classe de cor dos tokens da marca de forma determinística pelo nome', () => {
    const { unmount } = render(<Avatar name="Gabriel Souza" />);
    const firstClassName = screen.getByRole('img', {
      name: 'Avatar de Gabriel Souza',
    }).className;
    unmount();

    render(<Avatar name="Gabriel Souza" />);
    const secondClassName = screen.getByRole('img', {
      name: 'Avatar de Gabriel Souza',
    }).className;

    expect(firstClassName).toBe(secondClassName);
  });

  it('deve renderizar a imagem quando avatarUrl for fornecido', () => {
    render(
      <Avatar name="Ana Clara" avatarUrl="https://cdn.ascii.org.br/avatars/ana.png" size="lg" />,
    );
    const img = screen.getByRole('img', { name: 'Foto de Ana Clara' });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://cdn.ascii.org.br/avatars/ana.png');
    expect(img).toHaveClass('h-14', 'w-14');
  });
});
