# ADR 001 — Contratos de Integração com a Squad 1 (Operacional)

- **Status**: Aprovado
- **Data**: 2026-11-18
- **Responsáveis**: Squad 2 (Corporativo) & Squad 1 (Operacional)

---

## 1. Contexto

O ERP da **ASCII Soluções em Tecnologia** é construído sob uma arquitetura de **Monolito Modular** dividida entre duas frentes:
- **Squad 2 (Corporativo)**: Responsável pelos módulos de Autenticação & RBAC (`auth`), Diretório de Membros (`members`), Hub do Google Drive (`drive`), Treinamentos & OKRs (`training-okrs`), Fluxo de Caixa Financeiro (`finance`) e Auditoria Transversal (`shared/audit`).
- **Squad 1 (Operacional)**: Responsável pelos módulos operacionais (gestão de projetos, CRM comercial, alocações e entregas), que consomem a identidade de utilizadores autenticados, o diretório ativo de membros e a camada transversal de auditoria fornecidos pela Squad 2.

Este documento formaliza os contratos de integração (JWT, API HTTP, serviços exportados, regras de RBAC e envelope de erros) para garantir fronteiras limpas e ausência de acoplamento interno entre módulos.

---

## 2. Contrato de Autenticação e Payload do JWT

O módulo `auth` da Squad 2 emite tokens JWT assinados que são validados globalmente pelos Guards de autenticação. Todo o payload decodificado em `request.user` respeita estritamente a seguinte interface:

```typescript
export interface JwtPayload {
  sub: string; // UUID do membro (Member.id)
  email: string; // E-mail institucional (@ascii.org.br)
  systemRole: 'PRESIDENCIA' | 'DIRETOR' | 'MEMBRO'; // Nível de acesso (AccessLevel)
  roleTitle: string; // Cargo nominal (ex.: "Presidente", "Diretor de Projetos", "Desenvolvedor")
  department: string; // Diretoria de alocação (ex.: "PRESIDENCIA", "FINANCEIRO", "PROJETOS")
}
```

---

## 3. Contrato do Módulo `members` (Diretório de Membros)

### 3.1. Campos Públicos da Entidade `Member`
Qualquer retorno HTTP ou método público do `MembersService` expõe apenas os dados públicos do membro, **excluindo obrigatoriamente o campo sensível `passwordHash`**:

```typescript
export interface PublicMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  roleTitle: string;
  accessLevel: 'PRESIDENCIA' | 'DIRETOR' | 'MEMBRO';
  department: string;
  course: string | null;
  semester: string | null;
  squadName: string | null;
  skills: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2. Endpoint HTTP Público (REST)
- **Rota**: `GET /api/members?active=true`
- **Descrição**: Lista os membros cadastrados no diretório da ASCII, permitindo filtrar apenas membros ativos (`isActive = true`) para seleção em squads, projetos e atividades operacionais da Squad 1.
- **Autenticação**: Requer token Bearer JWT válido.

### 3.3. Métodos Públicos Exportados (`MembersService`)
Para comunicação interna no monolito modular (sem importação de repositórios ou entidades privadas), o `MembersModule` exporta o `MembersService` com os seguintes contratos fundamentais para a Squad 1:

- `MembersService.findAllActive(): Promise<PublicMember[]>`
  Retorna todos os membros com `isActive: true`, sem `passwordHash`, ordenados por nome.
- `MembersService.findById(id: string): Promise<PublicMember>`
  Busca um membro específico pelo seu UUID (`id`), sem `passwordHash`, lançando `NotFoundException` (HTTP 404) caso não exista.

---

## 4. Regra de Acesso Financeiro (RBAC)

O módulo `finance` possui restrição estrita de acesso. Apenas utilizadores cujo perfil satisfaça a condição lógica abaixo podem visualizar ou registar transações financeiras:

```typescript
const hasFinanceAccess =
  user.accessLevel === 'PRESIDENCIA' ||
  (user.accessLevel === 'DIRETOR' && user.department === 'FINANCEIRO');
```

Qualquer tentativa de acesso por outros diretores (ex.: `DIRETOR` de `PROJETOS`) ou membros (`MEMBRO`) resulta imediatamente em `ForbiddenException` (HTTP 403).

---

## 5. Padrão de Envelope de Erros HTTP (NestJS)

Todas as respostas de erro da API seguem o envelope padrão de exceções HTTP do NestJS:

```json
{
  "statusCode": 400,
  "message": "Descrição clara do erro ou array de validações",
  "error": "Bad Request"
}
```

| Código HTTP | Exceção NestJS (`@nestjs/common`) | Cenário de Uso |
|---|---|---|
| `400` | `BadRequestException` | Falha de validação de payload (DTO), parâmetros inválidos ou violação de regra de domínio. |
| `401` | `UnauthorizedException` | Token JWT ausente, expirado, malformado ou credenciais inválidas no login. |
| `403` | `ForbiddenException` | Utilizador autenticado, porém sem permissão de cargo/diretoria (RBAC) para o recurso. |
| `404` | `NotFoundException` | Recurso solicitado (ex.: `Member`, `DriveCard`, `OkrGoal`, `FinancialTransaction`) não encontrado pelo UUID. |

---

## 6. Uso Transversal de Auditoria (`AuditService`)

O módulo global/compartilhado `AuditModule` (`backend/src/shared/audit/`) exporta o `AuditService` para rastreabilidade de operações críticas de criação, atualização e remoção em todos os módulos (Squad 1 e Squad 2).

- **Localização**: `backend/src/shared/audit/`
- **Regra Arquitetural**: Módulos em `shared/` não importam nada de `modules/`. Os módulos de domínio injetam `AuditService` para registar eventos na tabela `AuditLog` contendo `authorId`, `module`, `action` e `details` (opcional).
