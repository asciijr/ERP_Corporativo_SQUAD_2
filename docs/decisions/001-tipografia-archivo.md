# ADR 001 — Fonte de Títulos (`Archive` vs `Archivo` no Google Fonts)

- **Data**: 2026-11-18
- **Status**: Aceite
- **Contexto**: O Manual de Identidade Visual da ASCII e o `ascii-design.md` (seção 2.3) especificam a fonte **Archive** para títulos (`H1`/`H2`, token `--font-display`) e orientam confirmar o nome exato da família disponível no Google Fonts (onde consta como **Archivo**) e registar a decisão em `docs/decisions/`.
- **Decisão**:
  1. Carregar `Archivo:wght@700` juntamente com `Montserrat:wght@400;500;600;700;800` via `<link>` do Google Fonts em `frontend/index.html`.
  2. Definir `--font-display: "Archive", "Archivo", "Montserrat", ui-sans-serif, sans-serif;` em `frontend/src/styles/theme.css`, priorizando `Archive` caso instalada localmente e fazendo fallback imediato para `Archivo` carregada via Google Fonts.
