import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, TransactionType } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { FINANCE_AUDIT_MODULE, FinanceService } from './finance.service';

const AUTHOR_ID = '22222222-2222-4222-8222-222222222222';
const author = { id: AUTHOR_ID, name: 'Diretoria Financeira' };

function tx(
  type: TransactionType,
  amount: string,
  category: string,
  isoDate: string,
): { type: TransactionType; amount: Prisma.Decimal; category: string; transactionDate: Date } {
  return {
    type,
    amount: new Prisma.Decimal(amount),
    category,
    transactionDate: new Date(isoDate),
  };
}

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: {
    financialTransaction: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
    };
  };
  let auditService: { log: jest.Mock };

  beforeEach(async () => {
    prisma = {
      financialTransaction: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    };
    auditService = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get(FinanceService);
  });

  describe('createTransaction', () => {
    const dto: CreateTransactionDto = {
      type: TransactionType.INCOME,
      amount: 1500.5,
      category: 'Projetos',
      description: 'Parcela do projeto X',
      transactionDate: '2026-11-20',
    };

    it('should persist the transaction with authorId from the JWT and log FINANCE audit', async () => {
      prisma.financialTransaction.create.mockResolvedValue({
        id: 'tx-1',
        ...dto,
        amount: new Prisma.Decimal('1500.50'),
        transactionDate: new Date('2026-11-20T00:00:00.000Z'),
        createdAt: new Date('2026-11-20T12:00:00.000Z'),
        authorId: AUTHOR_ID,
        author,
      });

      const result = await service.createTransaction(AUTHOR_ID, dto);

      const createArgs = prisma.financialTransaction.create.mock.calls[0][0];
      expect(createArgs.data.authorId).toBe(AUTHOR_ID);
      expect(createArgs.data.amount.toString()).toBe('1500.5');
      expect(createArgs.data.transactionDate.toISOString()).toBe('2026-11-20T00:00:00.000Z');

      expect(auditService.log).toHaveBeenCalledTimes(1);
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: AUTHOR_ID,
          module: FINANCE_AUDIT_MODULE,
          action: 'CREATE_TRANSACTION',
        }),
      );
      expect(FINANCE_AUDIT_MODULE).toBe('FINANCE');

      expect(result.amount).toBe(1500.5);
      expect(typeof result.amount).toBe('number');
      expect(result.author).toEqual(author);
    });

    it.each([0, -10])(
      'should reject amount %p without touching the database or the audit log',
      async (amount) => {
        await expect(service.createTransaction(AUTHOR_ID, { ...dto, amount })).rejects.toThrow(
          BadRequestException,
        );
        expect(prisma.financialTransaction.create).not.toHaveBeenCalled();
        expect(auditService.log).not.toHaveBeenCalled();
      },
    );
  });

  describe('CreateTransactionDto validation', () => {
    const base = {
      type: 'EXPENSE',
      amount: 100,
      category: 'Infraestrutura',
      description: 'Servidor',
      transactionDate: '2026-11-10',
    };

    it('should accept a valid payload', async () => {
      const errors = await validate(plainToInstance(CreateTransactionDto, base));
      expect(errors).toHaveLength(0);
    });

    it.each([
      ['amount zero', { amount: 0 }, 'amount'],
      ['amount negativo', { amount: -5 }, 'amount'],
      ['amount com 3 casas', { amount: 10.123 }, 'amount'],
      ['type inválido', { type: 'TRANSFER' }, 'type'],
      ['categoria vazia', { category: '   ' }, 'category'],
      ['data inválida', { transactionDate: 'ontem' }, 'transactionDate'],
    ])('should reject %s', async (_label, override, field) => {
      const errors = await validate(
        plainToInstance(CreateTransactionDto, { ...base, ...override }),
      );
      expect(errors.map((error) => error.property)).toContain(field);
    });
  });

  describe('findAll', () => {
    it('should filter by month/year using a UTC [start, end) range plus type and category', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([]);

      await service.findAll({
        month: 11,
        year: 2026,
        type: TransactionType.EXPENSE,
        category: 'Eventos',
      });

      const where = prisma.financialTransaction.findMany.mock.calls[0][0].where;
      expect(where.transactionDate.gte.toISOString()).toBe('2026-11-01T00:00:00.000Z');
      expect(where.transactionDate.lt.toISOString()).toBe('2026-12-01T00:00:00.000Z');
      expect(where.type).toBe(TransactionType.EXPENSE);
      expect(where.category).toEqual({ equals: 'Eventos', mode: 'insensitive' });
    });

    it('should list everything when no filter is given', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([]);

      await service.findAll({});

      expect(prisma.financialTransaction.findMany.mock.calls[0][0].where).toEqual({});
    });

    it('should require year when month is sent', async () => {
      await expect(service.findAll({ month: 3 })).rejects.toThrow(BadRequestException);
    });

    it('should convert Decimal amounts to numbers', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([
        {
          id: 'tx-1',
          type: TransactionType.INCOME,
          amount: new Prisma.Decimal('0.10'),
          category: 'Projetos',
          description: 'x',
          transactionDate: new Date('2026-11-01'),
          createdAt: new Date('2026-11-01'),
          author,
        },
      ]);

      const [item] = await service.findAll({});
      expect(item.amount).toBe(0.1);
    });
  });

  describe('getSummary', () => {
    it('should compute exact totals and balance without floating point drift', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([
        tx(TransactionType.INCOME, '0.10', 'Projetos', '2026-11-03'),
        tx(TransactionType.INCOME, '0.20', 'Projetos', '2026-11-04'),
        tx(TransactionType.INCOME, '1000.00', 'Patrocínio', '2026-11-05'),
        tx(TransactionType.EXPENSE, '250.35', 'Infraestrutura', '2026-11-10'),
        tx(TransactionType.EXPENSE, '49.65', 'Eventos', '2026-11-28'),
      ]);

      const summary = await service.getSummary({ year: 2026, month: 11 });

      expect(summary.totalIncome).toBe(1000.3);
      expect(summary.totalExpense).toBe(300);
      expect(summary.balance).toBe(700.3);
    });

    it('should return zeros (and zero-filled months) when there are no transactions', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([]);

      const summary = await service.getSummary({ year: 2026, semester: 2 });

      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpense).toBe(0);
      expect(summary.balance).toBe(0);
      expect(summary.byCategory).toEqual([]);
      expect(summary.monthly).toHaveLength(6);
      expect(summary.monthly.every((m) => m.income === 0 && m.expense === 0)).toBe(true);
    });

    it('should report a negative balance when expenses exceed income', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([
        tx(TransactionType.INCOME, '100.00', 'Projetos', '2026-11-03'),
        tx(TransactionType.EXPENSE, '180.50', 'Eventos', '2026-11-04'),
      ]);

      const summary = await service.getSummary({ year: 2026, month: 11 });

      expect(summary.balance).toBe(-80.5);
    });

    it('should aggregate the monthly comparison for a semester', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([
        tx(TransactionType.INCOME, '500.00', 'Projetos', '2026-07-15'),
        tx(TransactionType.EXPENSE, '120.00', 'Eventos', '2026-07-20'),
        tx(TransactionType.INCOME, '300.00', 'Projetos', '2026-09-01'),
        tx(TransactionType.EXPENSE, '80.00', 'Infraestrutura', '2026-12-31T23:59:59.000Z'),
      ]);

      const summary = await service.getSummary({ year: 2026, semester: 2 });

      const where = prisma.financialTransaction.findMany.mock.calls[0][0].where;
      expect(where.transactionDate.gte.toISOString()).toBe('2026-07-01T00:00:00.000Z');
      expect(where.transactionDate.lt.toISOString()).toBe('2027-01-01T00:00:00.000Z');

      expect(summary.monthly.map((m) => m.label)).toEqual([
        '2026-07',
        '2026-08',
        '2026-09',
        '2026-10',
        '2026-11',
        '2026-12',
      ]);
      expect(summary.monthly[0]).toMatchObject({ income: 500, expense: 120, balance: 380 });
      expect(summary.monthly[1]).toMatchObject({ income: 0, expense: 0, balance: 0 });
      expect(summary.monthly[2]).toMatchObject({ income: 300, expense: 0 });
      expect(summary.monthly[5]).toMatchObject({ income: 0, expense: 80 });
      expect(summary.period).toMatchObject({ year: 2026, semester: 2, month: null });
    });

    it('should aggregate totals by category, sorted by total desc', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([
        tx(TransactionType.INCOME, '900.00', 'Projetos', '2026-11-01'),
        tx(TransactionType.EXPENSE, '100.00', 'Projetos', '2026-11-02'),
        tx(TransactionType.EXPENSE, '300.00', 'Eventos', '2026-11-03'),
        tx(TransactionType.EXPENSE, '50.25', 'Infraestrutura', '2026-11-04'),
        tx(TransactionType.EXPENSE, '49.75', 'Infraestrutura', '2026-11-05'),
      ]);

      const summary = await service.getSummary({ year: 2026, month: 11 });

      expect(summary.byCategory).toEqual([
        { category: 'Projetos', income: 900, expense: 100, total: 1000 },
        { category: 'Eventos', income: 0, expense: 300, total: 300 },
        { category: 'Infraestrutura', income: 0, expense: 100, total: 100 },
      ]);
    });

    it('should cover the whole year when neither month nor semester is sent', async () => {
      prisma.financialTransaction.findMany.mockResolvedValue([]);

      const summary = await service.getSummary({ year: 2026 });

      expect(summary.monthly).toHaveLength(12);
      expect(summary.period.startDate.toISOString()).toBe('2026-01-01T00:00:00.000Z');
      expect(summary.period.endDate.toISOString()).toBe('2027-01-01T00:00:00.000Z');
    });

    it('should reject month and semester together', async () => {
      const query: SummaryQueryDto = { year: 2026, month: 3, semester: 1 };
      await expect(service.getSummary(query)).rejects.toThrow(BadRequestException);
    });
  });

  describe('removeTransaction', () => {
    it('should delete and log FINANCE audit', async () => {
      prisma.financialTransaction.findUnique.mockResolvedValue({
        id: 'tx-9',
        type: TransactionType.EXPENSE,
        amount: new Prisma.Decimal('42.00'),
        category: 'Eventos',
      });

      await service.removeTransaction(AUTHOR_ID, 'tx-9');

      expect(prisma.financialTransaction.delete).toHaveBeenCalledWith({ where: { id: 'tx-9' } });
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          authorId: AUTHOR_ID,
          module: 'FINANCE',
          action: 'DELETE_TRANSACTION',
        }),
      );
    });

    it('should throw 404 and not audit when the transaction does not exist', async () => {
      prisma.financialTransaction.findUnique.mockResolvedValue(null);

      await expect(service.removeTransaction(AUTHOR_ID, 'missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(prisma.financialTransaction.delete).not.toHaveBeenCalled();
      expect(auditService.log).not.toHaveBeenCalled();
    });
  });
});
