import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { AuditService } from '../../shared/audit/audit.service';
import { PrismaService } from '../../shared/database/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';

export const FINANCE_AUDIT_MODULE = 'FINANCE';

/**
 * Formato único de resposta: valores monetários sempre como `number` com no
 * máximo 2 casas decimais. Internamente as somas usam Prisma.Decimal para não
 * acumular erro de ponto flutuante.
 */
export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  transactionDate: Date;
  createdAt: Date;
  author: { id: string; name: string };
}

export interface MonthlyComparisonItem {
  year: number;
  month: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotalItem {
  category: string;
  income: number;
  expense: number;
  total: number;
}

export interface FinanceSummaryResponse {
  period: {
    year: number;
    month: number | null;
    semester: 1 | 2 | null;
    startDate: Date;
    endDate: Date;
  };
  totalIncome: number;
  totalExpense: number;
  balance: number;
  monthly: MonthlyComparisonItem[];
  byCategory: CategoryTotalItem[];
}

type DecimalLike = Prisma.Decimal | number | string;

interface TransactionRecord {
  id: string;
  type: TransactionType;
  amount: DecimalLike;
  category: string;
  description: string;
  transactionDate: Date;
  createdAt: Date;
  author: { id: string; name: string };
}

interface ResolvedPeriod {
  year: number;
  month: number | null;
  semester: 1 | 2 | null;
  start: Date;
  end: Date;
  months: number[];
}

const authorSelect = { select: { id: true, name: true } } as const;

const ZERO = new Prisma.Decimal(0);

const DEFAULT_PAGE_SIZE = 100;

function toDecimal(value: DecimalLike): Prisma.Decimal {
  return new Prisma.Decimal(value.toString());
}

function toMoney(value: Prisma.Decimal): number {
  return value.toDecimalPlaces(2).toNumber();
}

@Injectable()
export class FinanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createTransaction(
    authorId: string,
    dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    if (!(dto.amount > 0)) {
      throw new BadRequestException('amount deve ser maior que zero');
    }

    // Usa só o dia do calendário enviado (YYYY-MM-DD) em UTC, para o offset do cliente não trocar o mês
    const transactionDate = new Date(`${dto.transactionDate.slice(0, 10)}T00:00:00.000Z`);
    if (Number.isNaN(transactionDate.getTime())) {
      throw new BadRequestException('transactionDate inválida');
    }

    const created = (await this.prisma.financialTransaction.create({
      data: {
        type: dto.type,
        amount: new Prisma.Decimal(dto.amount.toFixed(2)),
        category: dto.category,
        description: dto.description,
        transactionDate,
        authorId,
      },
      include: { author: authorSelect },
    })) as TransactionRecord;

    await this.auditService.log({
      authorId,
      module: FINANCE_AUDIT_MODULE,
      action: 'CREATE_TRANSACTION',
      details: `${created.type} de R$ ${toMoney(toDecimal(created.amount)).toFixed(2)} em ${created.category} (${created.id})`,
    });

    return this.toResponse(created);
  }

  async findAll(query: ListTransactionsQueryDto): Promise<TransactionResponse[]> {
    const where: Prisma.FinancialTransactionWhereInput = {};

    if (query.month !== undefined && query.year === undefined) {
      throw new BadRequestException('Informe year junto com month');
    }

    if (query.year !== undefined) {
      const period = this.resolvePeriod({ year: query.year, month: query.month });
      where.transactionDate = { gte: period.start, lt: period.end };
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.category) {
      where.category = { equals: query.category, mode: 'insensitive' };
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? DEFAULT_PAGE_SIZE;

    const transactions = (await this.prisma.financialTransaction.findMany({
      where,
      include: { author: authorSelect },
      orderBy: [{ transactionDate: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    })) as TransactionRecord[];

    return transactions.map((transaction) => this.toResponse(transaction));
  }

  async getSummary(query: SummaryQueryDto): Promise<FinanceSummaryResponse> {
    const period = this.resolvePeriod(query);

    const transactions = (await this.prisma.financialTransaction.findMany({
      where: { transactionDate: { gte: period.start, lt: period.end } },
      select: { type: true, amount: true, category: true, transactionDate: true },
    })) as Array<Pick<TransactionRecord, 'type' | 'amount' | 'category' | 'transactionDate'>>;

    let totalIncome = ZERO;
    let totalExpense = ZERO;

    const monthlyMap = new Map<number, { income: Prisma.Decimal; expense: Prisma.Decimal }>(
      period.months.map((month) => [month, { income: ZERO, expense: ZERO }]),
    );
    const categoryMap = new Map<
      string,
      { label: string; income: Prisma.Decimal; expense: Prisma.Decimal }
    >();

    for (const transaction of transactions) {
      const amount = toDecimal(transaction.amount);
      const isIncome = transaction.type === TransactionType.INCOME;
      const month = transaction.transactionDate.getUTCMonth() + 1;

      if (isIncome) {
        totalIncome = totalIncome.plus(amount);
      } else {
        totalExpense = totalExpense.plus(amount);
      }

      const monthBucket = monthlyMap.get(month);
      if (monthBucket) {
        if (isIncome) monthBucket.income = monthBucket.income.plus(amount);
        else monthBucket.expense = monthBucket.expense.plus(amount);
      }

      // Agrupa ignorando caixa/espaços (mesma regra do filtro insensitive do findAll); rótulo = 1ª grafia vista
      const label = transaction.category.trim();
      const categoryKey = label.toUpperCase();
      const categoryBucket = categoryMap.get(categoryKey) ?? { label, income: ZERO, expense: ZERO };
      if (isIncome) categoryBucket.income = categoryBucket.income.plus(amount);
      else categoryBucket.expense = categoryBucket.expense.plus(amount);
      categoryMap.set(categoryKey, categoryBucket);
    }

    const monthly: MonthlyComparisonItem[] = period.months.map((month) => {
      const bucket = monthlyMap.get(month) ?? { income: ZERO, expense: ZERO };
      return {
        year: period.year,
        month,
        label: `${period.year}-${String(month).padStart(2, '0')}`,
        income: toMoney(bucket.income),
        expense: toMoney(bucket.expense),
        balance: toMoney(bucket.income.minus(bucket.expense)),
      };
    });

    const byCategory: CategoryTotalItem[] = Array.from(categoryMap.values())
      .map((bucket) => ({
        category: bucket.label,
        income: toMoney(bucket.income),
        expense: toMoney(bucket.expense),
        total: toMoney(bucket.income.plus(bucket.expense)),
      }))
      .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));

    return {
      period: {
        year: period.year,
        month: period.month,
        semester: period.semester,
        startDate: period.start,
        endDate: period.end,
      },
      totalIncome: toMoney(totalIncome),
      totalExpense: toMoney(totalExpense),
      balance: toMoney(totalIncome.minus(totalExpense)),
      monthly,
      byCategory,
    };
  }

  async removeTransaction(authorId: string, id: string): Promise<void> {
    const existing = (await this.prisma.financialTransaction.findUnique({
      where: { id },
    })) as Omit<TransactionRecord, 'author'> | null;

    if (!existing) {
      throw new NotFoundException('Lançamento não encontrado');
    }

    try {
      await this.prisma.financialTransaction.delete({ where: { id } });
    } catch (error) {
      // P2025: outro request apagou o registro entre o findUnique e o delete
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new NotFoundException('Lançamento não encontrado');
      }
      throw error;
    }

    await this.auditService.log({
      authorId,
      module: FINANCE_AUDIT_MODULE,
      action: 'DELETE_TRANSACTION',
      details: `${existing.type} de R$ ${toMoney(toDecimal(existing.amount)).toFixed(2)} em ${existing.category} removido (${existing.id})`,
    });
  }

  private resolvePeriod(input: SummaryQueryDto): ResolvedPeriod {
    const { month, semester } = input;
    const year = input.year ?? new Date().getUTCFullYear();

    if (month !== undefined && semester !== undefined) {
      throw new BadRequestException('Use month ou semester, não os dois');
    }

    let firstMonth = 1;
    let lastMonth = 12;

    if (month !== undefined) {
      firstMonth = month;
      lastMonth = month;
    } else if (semester !== undefined) {
      firstMonth = semester === 1 ? 1 : 7;
      lastMonth = semester === 1 ? 6 : 12;
    }

    const months = Array.from(
      { length: lastMonth - firstMonth + 1 },
      (_, index) => firstMonth + index,
    );

    return {
      year,
      month: month ?? null,
      semester: semester ?? null,
      start: new Date(Date.UTC(year, firstMonth - 1, 1)),
      end: new Date(Date.UTC(year, lastMonth, 1)),
      months,
    };
  }

  private toResponse(transaction: TransactionRecord): TransactionResponse {
    return {
      id: transaction.id,
      type: transaction.type,
      amount: toMoney(toDecimal(transaction.amount)),
      category: transaction.category,
      description: transaction.description,
      transactionDate: transaction.transactionDate,
      createdAt: transaction.createdAt,
      author: transaction.author,
    };
  }
}
