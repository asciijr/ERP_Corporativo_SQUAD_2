import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'ok' }),
      }),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('deve consultar o endpoint /health e exibir "API: ok"', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('API: ok')).toBeInTheDocument();
    });
  });
});
