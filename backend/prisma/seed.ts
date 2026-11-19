import {
  AccessLevel,
  PlaybookScope,
  PrismaClient,
  TransactionType,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('Ascii@2026', 10);

  const admin = await prisma.member.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {
      name: 'Admin',
      email: 'admin@asciiej.com.br',
      ufuEmail: 'admin@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Admin',
      accessLevel: AccessLevel.PRESIDENCIA,
      department: 'ADMIN',
      course: 'Bacharelado em Ciência da Computação',
      semester: '8º Período',
      squadName: 'Gestão Executiva',
      skills: ['Gestão Estratégica', 'Governança', 'OKRs'],
      birthDate: '2002-01-01',
      phone: '34999990000',
      cpf: '11111111111',
      ufuRegistration: '12011BCC001',
      isActive: true,
    },
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Admin',
      email: 'admin@asciiej.com.br',
      ufuEmail: 'admin@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Admin',
      accessLevel: AccessLevel.PRESIDENCIA,
      department: 'ADMIN',
      course: 'Bacharelado em Ciência da Computação',
      semester: '8º Período',
      squadName: 'Gestão Executiva',
      skills: ['Gestão Estratégica', 'Governança', 'OKRs'],
      birthDate: '2002-01-01',
      phone: '34999990000',
      cpf: '11111111111',
      ufuRegistration: '12011BCC001',
      isActive: true,
    },
  });

  await prisma.member.upsert({
    where: { id: '11111111-1111-4111-8111-111111111112' },
    update: {
      name: 'Admin',
      email: 'presidencia@asciiej.com.br',
      ufuEmail: 'presidencia@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Admin',
      accessLevel: AccessLevel.PRESIDENCIA,
      department: 'ADMIN',
      course: 'Bacharelado em Ciência da Computação',
      semester: '8º Período',
      squadName: 'Gestão Executiva',
      skills: ['Gestão Estratégica', 'Governança', 'OKRs'],
      birthDate: '2002-01-01',
      phone: '34999991111',
      cpf: '11111111112',
      ufuRegistration: '12011BCC000',
      isActive: true,
    },
    create: {
      id: '11111111-1111-4111-8111-111111111112',
      name: 'Admin',
      email: 'presidencia@asciiej.com.br',
      ufuEmail: 'presidencia@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Admin',
      accessLevel: AccessLevel.PRESIDENCIA,
      department: 'ADMIN',
      course: 'Bacharelado em Ciência da Computação',
      semester: '8º Período',
      squadName: 'Gestão Executiva',
      skills: ['Gestão Estratégica', 'Governança', 'OKRs'],
      birthDate: '2002-01-01',
      phone: '34999991111',
      cpf: '11111111112',
      ufuRegistration: '12011BCC000',
      isActive: true,
    },
  });

  const financeiro = await prisma.member.upsert({
    where: { id: '22222222-2222-4222-8222-222222222222' },
    update: {
      name: 'Diretoria Financeira',
      email: 'financeiro@asciiej.com.br',
      ufuEmail: 'financeiro@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Diretor',
      accessLevel: AccessLevel.DIRETOR,
      department: 'FINANCEIRO',
      course: 'Bacharelado em Sistemas de Informação',
      semester: '6º Período',
      squadName: 'Gestão & Finanças',
      skills: ['Fluxo de Caixa', 'DRE', 'Compliance'],
      birthDate: '2002-07-20',
      phone: '34999992222',
      cpf: '22222222222',
      ufuRegistration: '12011BSI002',
      isActive: true,
    },
    create: {
      id: '22222222-2222-4222-8222-222222222222',
      name: 'Diretoria Financeira',
      email: 'financeiro@asciiej.com.br',
      ufuEmail: 'financeiro@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Diretor',
      accessLevel: AccessLevel.DIRETOR,
      department: 'FINANCEIRO',
      course: 'Bacharelado em Sistemas de Informação',
      semester: '6º Período',
      squadName: 'Gestão & Finanças',
      skills: ['Fluxo de Caixa', 'DRE', 'Compliance'],
      birthDate: '2002-07-20',
      phone: '34999992222',
      cpf: '22222222222',
      ufuRegistration: '12011BSI002',
      isActive: true,
    },
  });

  const projetos = await prisma.member.upsert({
    where: { id: '33333333-3333-4333-8333-333333333333' },
    update: {
      name: 'Diretoria de Projetos',
      email: 'projetos@asciiej.com.br',
      ufuEmail: 'projetos@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Diretor',
      accessLevel: AccessLevel.DIRETOR,
      department: 'PROJETOS',
      course: 'Bacharelado em Ciência da Computação',
      semester: '6º Período',
      squadName: 'Squad 1',
      skills: ['Scrum', 'Arquitetura de Software', 'NestJS'],
      birthDate: '2003-01-10',
      phone: '34999993333',
      cpf: '33333333333',
      ufuRegistration: '12111BCC003',
      isActive: true,
    },
    create: {
      id: '33333333-3333-4333-8333-333333333333',
      name: 'Diretoria de Projetos',
      email: 'projetos@asciiej.com.br',
      ufuEmail: 'projetos@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Diretor',
      accessLevel: AccessLevel.DIRETOR,
      department: 'PROJETOS',
      course: 'Bacharelado em Ciência da Computação',
      semester: '6º Período',
      squadName: 'Squad 1',
      skills: ['Scrum', 'Arquitetura de Software', 'NestJS'],
      birthDate: '2003-01-10',
      phone: '34999993333',
      cpf: '33333333333',
      ufuRegistration: '12111BCC003',
      isActive: true,
    },
  });

  const membro = await prisma.member.upsert({
    where: { id: '44444444-4444-4444-8444-444444444444' },
    update: {
      name: 'Diretoria de Projetos — Assessoria',
      email: 'membro@asciiej.com.br',
      ufuEmail: 'assessoria.projetos@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Assessor',
      accessLevel: AccessLevel.MEMBRO,
      department: 'PROJETOS',
      course: 'Bacharelado em Sistemas de Informação',
      semester: '4º Período',
      squadName: 'Squad 2',
      skills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL'],
      birthDate: '2004-09-05',
      phone: '34999994444',
      cpf: '44444444444',
      ufuRegistration: '12211BSI004',
      isActive: true,
    },
    create: {
      id: '44444444-4444-4444-8444-444444444444',
      name: 'Diretoria de Projetos — Assessoria',
      email: 'membro@asciiej.com.br',
      ufuEmail: 'assessoria.projetos@ufu.br',
      passwordHash,
      avatarUrl: null,
      roleTitle: 'Assessor',
      accessLevel: AccessLevel.MEMBRO,
      department: 'PROJETOS',
      course: 'Bacharelado em Sistemas de Informação',
      semester: '4º Período',
      squadName: 'Squad 2',
      skills: ['TypeScript', 'React', 'NestJS', 'PostgreSQL'],
      birthDate: '2004-09-05',
      phone: '34999994444',
      cpf: '44444444444',
      ufuRegistration: '12211BSI004',
      isActive: true,
    },
  });

  await prisma.driveCard.upsert({
    where: { id: '55555555-5555-4555-8555-555555555551' },
    update: {
      title: 'Manual de Identidade Visual ASCII',
      description: 'Guia oficial de marca, cores, tipografia e componentes da ASCII.',
      driveUrl: 'https://drive.google.com/drive/folders/ascii-identidade-visual',
      category: 'PRESIDENCIA',
      createdById: admin.id,
    },
    create: {
      id: '55555555-5555-4555-8555-555555555551',
      title: 'Manual de Identidade Visual ASCII',
      description: 'Guia oficial de marca, cores, tipografia e componentes da ASCII.',
      driveUrl: 'https://drive.google.com/drive/folders/ascii-identidade-visual',
      category: 'PRESIDENCIA',
      createdById: admin.id,
    },
  });

  await prisma.driveCard.upsert({
    where: { id: '55555555-5555-4555-8555-555555555552' },
    update: {
      title: 'Planilha Mestre e Contratos 2026',
      description: 'Repositório de notas fiscais, contratos e prestação de contas.',
      driveUrl: 'https://drive.google.com/drive/folders/ascii-financeiro-2026',
      category: 'FINANCEIRO',
      createdById: financeiro.id,
    },
    create: {
      id: '55555555-5555-4555-8555-555555555552',
      title: 'Planilha Mestre e Contratos 2026',
      description: 'Repositório de notas fiscais, contratos e prestação de contas.',
      driveUrl: 'https://drive.google.com/drive/folders/ascii-financeiro-2026',
      category: 'FINANCEIRO',
      createdById: financeiro.id,
    },
  });

  const playbookOnboarding = await prisma.playbookItem.upsert({
    where: { id: '66666666-6666-4666-8666-666666666661' },
    update: {
      title: 'Configurar Ambiente Docker-First do ERP',
      description: 'Subir containers locais, rodar migrações e validar testes automatizados.',
      scope: PlaybookScope.INDIVIDUAL,
      targetSquad: null,
      orderIndex: 1,
      isCompleted: false,
    },
    create: {
      id: '66666666-6666-4666-8666-666666666661',
      title: 'Configurar Ambiente Docker-First do ERP',
      description: 'Subir containers locais, rodar migrações e validar testes automatizados.',
      scope: PlaybookScope.INDIVIDUAL,
      targetSquad: null,
      orderIndex: 1,
      isCompleted: false,
    },
  });

  await prisma.playbookItem.upsert({
    where: { id: '66666666-6666-4666-8666-666666666662' },
    update: {
      title: 'Revisão de Arquitetura e Contratos Squad 2',
      description: 'Validar fronteiras entre módulos e ADR-001 com a Squad 1.',
      scope: PlaybookScope.SQUAD,
      targetSquad: 'Squad 2',
      orderIndex: 2,
      isCompleted: true,
    },
    create: {
      id: '66666666-6666-4666-8666-666666666662',
      title: 'Revisão de Arquitetura e Contratos Squad 2',
      description: 'Validar fronteiras entre módulos e ADR-001 com a Squad 1.',
      scope: PlaybookScope.SQUAD,
      targetSquad: 'Squad 2',
      orderIndex: 2,
      isCompleted: true,
    },
  });

  await prisma.memberChecklist.upsert({
    where: {
      memberId_playbookItemId: {
        memberId: membro.id,
        playbookItemId: playbookOnboarding.id,
      },
    },
    update: {
      completed: true,
      completedAt: new Date('2026-11-18T12:00:00.000Z'),
    },
    create: {
      memberId: membro.id,
      playbookItemId: playbookOnboarding.id,
      completed: true,
      completedAt: new Date('2026-11-18T12:00:00.000Z'),
    },
  });

  await prisma.okrGoal.upsert({
    where: { id: '77777777-7777-4777-8777-777777777771' },
    update: {
      title: 'Faturamento Anual de Projetos',
      directorate: 'PRESIDENCIA',
      currentValue: 42500,
      targetValue: 60000,
      unit: 'R$',
      semester: '2026.2',
    },
    create: {
      id: '77777777-7777-4777-8777-777777777771',
      title: 'Faturamento Anual de Projetos',
      directorate: 'PRESIDENCIA',
      currentValue: 42500,
      targetValue: 60000,
      unit: 'R$',
      semester: '2026.2',
    },
  });

  await prisma.okrGoal.upsert({
    where: { id: '77777777-7777-4777-8777-777777777772' },
    update: {
      title: 'Entregas de Sprints no Prazo',
      directorate: 'PROJETOS',
      currentValue: 92,
      targetValue: 95,
      unit: '%',
      semester: '2026.2',
    },
    create: {
      id: '77777777-7777-4777-8777-777777777772',
      title: 'Entregas de Sprints no Prazo',
      directorate: 'PROJETOS',
      currentValue: 92,
      targetValue: 95,
      unit: '%',
      semester: '2026.2',
    },
  });

  await prisma.financialTransaction.upsert({
    where: { id: '88888888-8888-4888-8888-888888888881' },
    update: {
      type: TransactionType.INCOME,
      amount: 12500.0,
      category: 'PROJETOS',
      description: 'Parcela 1 — Desenvolvimento Sistema Web Institucional',
      transactionDate: new Date('2026-11-05T14:30:00.000Z'),
      authorId: financeiro.id,
    },
    create: {
      id: '88888888-8888-4888-8888-888888888881',
      type: TransactionType.INCOME,
      amount: 12500.0,
      category: 'PROJETOS',
      description: 'Parcela 1 — Desenvolvimento Sistema Web Institucional',
      transactionDate: new Date('2026-11-05T14:30:00.000Z'),
      authorId: financeiro.id,
    },
  });

  await prisma.financialTransaction.upsert({
    where: { id: '88888888-8888-4888-8888-888888888882' },
    update: {
      type: TransactionType.EXPENSE,
      amount: 450.0,
      category: 'INFRAESTRUTURA',
      description: 'Licenças Cloud e Domínio Institucional ASCII',
      transactionDate: new Date('2026-11-10T10:00:00.000Z'),
      authorId: projetos.id,
    },
    create: {
      id: '88888888-8888-4888-8888-888888888882',
      type: TransactionType.EXPENSE,
      amount: 450.0,
      category: 'INFRAESTRUTURA',
      description: 'Licenças Cloud e Domínio Institucional ASCII',
      transactionDate: new Date('2026-11-10T10:00:00.000Z'),
      authorId: projetos.id,
    },
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
