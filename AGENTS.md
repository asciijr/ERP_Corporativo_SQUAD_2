# Diretrizes para Agentes de IA e Desenvolvedores — ERP Corporativo (Squad 2)

Este ficheiro estabelece as regras arquiteturais e operacionais inegociáveis do projeto **ERP Corporativo — ASCII Soluções em Tecnologia (Squad 2)**, alinhadas ao Guia de Engenharia da ASCII e ao padrão da Squad 1.

## 1. Ambiente Docker-First
- **Tudo corre via Docker Compose**: Imagens base oficiais padronizadas (`node:24-alpine`, `postgres:16-alpine`, `nginx:1.27-alpine`).
- **Proibido executar comandos globais no host**: Comandos de instalação, build, migração, lint e testes devem correr exclusivamente dentro dos containers (`docker compose exec backend ...` / `docker compose exec frontend ...`).

## 2. Backend (Monolito Modular)
- **Stack**: NestJS + TypeScript + Prisma `5.22.0` localizado em `backend/`.
- **Estrutura de Módulos**:
  - `backend/src/modules/`: `auth`, `members`, `drive`, `training-okrs`, `finance`.
  - `backend/src/shared/`: `audit`, `database`.
- **Encapsulamento e Fronteiras**: É estritamente **proibido importar ficheiros internos** (repositórios, entidades privadas, helpers internos ou controllers) entre módulos distintos. A comunicação entre módulos deve ocorrer **apenas através do Service público exportado** pelo `Module` correspondente.

## 3. Frontend (Atomic Design)
- **Stack**: React + TypeScript + Vite + Tailwind CSS localizado em `frontend/src/`.
- **Identidade Visual e Arquitetura**: Seguir estritamente as diretrizes do `ascii-design.md` (`atoms`, `molecules`, `organisms`, `templates`, `pages`).
- **Proibições**:
  - Proibido o uso de `any`.
  - Proibido o uso de cores, fontes ou espaçamentos hardcoded (utilizar exclusivamente os tokens definidos no tema).
  - Proibido realizar chamadas de API ou acoplar regras de negócio dentro de `atoms`, `molecules` e `organisms` (dados e callbacks devem vir via `props`; chamadas à API residem em `services/` e são consumidas em `hooks/` ou `pages/`).

## 4. Segurança, Qualidade e Testes (TDD)
- **Segurança**: Nunca commitar ficheiros `.env`, chaves privadas ou credenciais no repositório.
- **Integridade de Testes**: É estritamente **proibido alterar, simplificar ou comentar testes existentes** (`*.spec.ts` / `*.test.tsx`) para fazê-los passar. O código de implementação deve adaptar-se aos testes.
- **Gestão de Dependências**: É **proibido instalar novas dependências** (`npm install <pacote>`) sem avaliação e aval explícito do Tech Lead.

## 5. Convenções de Código e Versionamento
- **Idioma do Código**: Todo o código-fonte (nomes de variáveis, funções, classes, interfaces, tipos, rotas e ficheiros) deve ser escrito em **inglês**.
- **Idioma de UI e Commits**: Todos os textos exibidos na interface do utilizador (pt-BR) e todas as mensagens de commit devem ser escritos em **português**.
- **Commits**: Seguir o padrão **Conventional Commits**, no modo **imperativo** e em **minúsculas** (ex.: `feat(members): adiciona listagem de membros`, `fix(auth): corrige validação de token jwt`).
