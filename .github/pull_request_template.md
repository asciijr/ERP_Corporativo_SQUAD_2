## Descrição

Descreva de forma clara e objetiva o que este Pull Request implementa, corrige ou altera.

## Card / Issue Relacionada

- Card: `T-XX`
- Issue / Link: #

## Tipo de Alteração

- [ ] `feat`: Nova funcionalidade
- [ ] `fix`: Correção de bug
- [ ] `refactor`: Refatoração de código (sem alteração de comportamento)
- [ ] `style`: Ajustes visuais / formatação (Tailwind, tokens, UI)
- [ ] `test`: Adição ou atualização de testes
- [ ] `chore` / `ci` / `docs`: Configuração, infraestrutura ou documentação

## Checklist de Qualidade (Guia de Engenharia ASCII)

- [ ] A branch segue o padrão de nomenclatura e aponta para a branch correta (`develop` ou `main` via release/hotfix).
- [ ] O código segue a arquitetura **Monolito Modular** no backend (sem importações internas entre módulos) e **Atomic Design** no frontend.
- [ ] Nenhum tipo `any`, `console.log` esquecido, cor hardcoded ou segredo (`.env`) foi incluído.
- [ ] Nenhum teste existente (`*.spec.ts` / `*.test.tsx`) foi alterado, simplificado ou comentado para forçar aprovação.
- [ ] Nenhuma nova dependência foi instalada sem aprovação prévia do Tech Lead.
- [ ] Todos os comandos de validação (`lint`, `typecheck`, `test`, `build`) foram executados e aprovados dentro do Docker.

## Como Testar

1. Suba o ambiente: `docker compose up --build`
2. Execute os passos...
