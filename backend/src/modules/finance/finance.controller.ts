import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, FinanceGuard, JwtAuthGuard } from '../auth';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { ListTransactionsQueryDto } from './dto/list-transactions-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';
import { FinanceService, FinanceSummaryResponse, TransactionResponse } from './finance.service';

@ApiTags('Finance')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente ou inválido.' })
@ApiResponse({
  status: 403,
  description: 'Acesso restrito à Presidência ou à Diretoria Financeira.',
})
@UseGuards(JwtAuthGuard, FinanceGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Registrar uma entrada (INCOME) ou saída (EXPENSE)' })
  @ApiResponse({ status: 201, description: 'Lançamento criado e auditado.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos (ex.: amount <= 0).' })
  async create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ): Promise<TransactionResponse> {
    return this.financeService.createTransaction(request.user.sub, dto);
  }

  @Get('transactions')
  @ApiOperation({
    summary: 'Listar lançamentos com filtros opcionais de período, tipo e categoria',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de lançamentos, do mais recente ao mais antigo.',
  })
  async findAll(@Query() query: ListTransactionsQueryDto): Promise<TransactionResponse[]> {
    return this.financeService.findAll(query);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Indicadores (entradas, saídas, saldo) e dados agregados para os 2 modos de gráfico',
  })
  @ApiResponse({ status: 200, description: 'Resumo financeiro do período.' })
  async getSummary(@Query() query: SummaryQueryDto): Promise<FinanceSummaryResponse> {
    return this.financeService.getSummary(query);
  }

  @Delete('transactions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover um lançamento' })
  @ApiResponse({ status: 204, description: 'Lançamento removido e auditado.' })
  @ApiResponse({ status: 404, description: 'Lançamento não encontrado.' })
  async remove(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    return this.financeService.removeTransaction(request.user.sub, id);
  }
}
