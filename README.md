# ERP Corporativo — ASCII Soluções em Tecnologia (Squad 2)

Sistema de Gestão Integrada (ERP) da **ASCII Soluções em Tecnologia** (Empresa Júnior da FACOM/UFU) — **Squad 2 (Módulos Corporativos)**.

---

## Stack Tecnológica

- **Ambiente & Orquestração**: Docker & Docker Compose (Abordagem *Docker-First*)
  - Node.js: `node:24-alpine`
  - Banco de Dados: PostgreSQL (`postgres:16-alpine`)
  - Servidor Web (Produção Frontend): Nginx (`nginx:1.27-alpine`)
- **Backend (`backend/`)**:
  - NestJS + TypeScript (Arquitetura em **Monolito Modular**)
  - Prisma ORM `5.22.0`
  - Autenticação JWT & RBAC
  - Testes com Jest + Supertest
- **Frontend (`frontend/`)**:
  - React + TypeScript + Vite
  - Tailwind CSS (seguindo o Manual de Identidade Visual da ASCII)
  - Arquitetura **Atomic Design** (`atoms`, `molecules`, `organisms`, `templates`, `pages`)
  - Testes com Vitest + Testing Library
- **Padronização & Qualidade**:
  - Husky + Commitlint (Conventional Commits) + Lint-Staged
  - GitHub Actions CI (`branch-guard`, `frontend`, `backend-node`, `docker`)

---

## Arquitetura de Módulos (Squad 2)

### Módulos de Domínio (`backend/src/modules/`)
| Módulo | Descrição |
|---|---|
| `auth` | Autenticação JWT, controle de sessão e guards de permissão por cargo/diretoria (RBAC). |
| `members` | Diretório e gestão de membros da ASCII, cargos, cursos, squads e tags de proficiência. |
| `drive` | Hub centralizado de atalhos e documentos do Google Drive organizados por área/diretoria. |
| `training-okrs` | Acompanhamento de OKRs da empresa e checklists do Playbook (individual e por squad). |
| `finance` | Gestão de fluxo de caixa (entradas, saídas, saldo mensal e visão por categoria) restrita à Presidência e Diretoria Financeira. |

### Módulos Compartilhados (`backend/src/shared/`)
| Módulo | Descrição |
|---|---|
| `database` | Configuração global do `PrismaService` e conexão com o PostgreSQL. |
| `audit` | Registo centralizado de logs de auditoria (`AuditService`) para rastreabilidade de ações críticas. |

> **Regra de Fronteira**: Módulos não importam ficheiros internos uns dos outros. Toda comunicação entre módulos ocorre exclusivamente via `Service` público exportado pelo respectivo `Module`.

---

## Como Executar (Docker-First)

> **Importante**: Nunca execute comandos de build, instalação ou migração diretamente no sistema host. Utilize sempre o Docker Compose.

### 1. Configurar variáveis de ambiente
Copie o ficheiro de exemplo (caso `.env` ainda não exista):
```bash
cp .env.example .env
```

### 2. Subir os containers em modo de desenvolvimento
```bash
docker compose up --build
```
- **Frontend (Vite)**: `http://localhost:5173`
- **Backend (NestJS)**: `http://localhost:3000`
- **Prisma Studio**: `http://localhost:5555`
- **PostgreSQL**: `localhost:5432`

### 3. Comandos Úteis no Container

#### Backend
```bash
# Executar migrações do Prisma
docker compose exec backend npx prisma migrate dev

# Executar seed do banco de dados
docker compose exec backend npx prisma db seed

# Lint, Typecheck, Testes e Build
docker compose exec backend npm run lint
docker compose exec backend npm run typecheck
docker compose exec backend npm test
docker compose exec backend npm run build
```

#### Frontend
```bash
# Lint, Typecheck, Testes e Build
docker compose exec frontend npm run lint
docker compose exec frontend npm run typecheck
docker compose exec frontend npm test
docker compose exec frontend npm run build
```

---

## Convenções de Desenvolvimento

- **Código**: Escrito em **inglês** (variáveis, funções, componentes, rotas, tabelas).
- **Interface (UI) e Commits**: Escritos em **português (pt-BR)**.
- **Mensagens de Commit**: Conventional Commits no imperativo e em minúsculas (ex.: `feat(finance): adiciona endpoint de resumo mensal`).
- **Decisões Arquiteturais (ADRs)**: Registadas em `docs/decisions/`.
