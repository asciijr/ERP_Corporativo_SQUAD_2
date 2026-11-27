import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PlaybookItem } from '@prisma/client';
import { AuthenticatedRequest, DirectorGuard, JwtAuthGuard } from '../auth';
import { CreatePlaybookItemDto } from './dto/create-playbook-item.dto';
import { ToggleChecklistDto } from './dto/toggle-checklist.dto';
import { UpdatePlaybookItemDto } from './dto/update-playbook-item.dto';
import {
  DeletePlaybookItemResponse,
  PlaybookOverviewResponse,
  ToggleChecklistResponse,
  TrainingService,
} from './training.service';

@ApiTags('Training')
@ApiBearerAuth()
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Get('playbook')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar Checklist Individual do usuário logado e Checklist do Squad' })
  @ApiQuery({
    name: 'squad',
    required: false,
    description: 'Filtrar o Checklist do Squad por um squad específico (padrão: squad do usuário)',
  })
  @ApiResponse({ status: 200, description: 'Checklists e percentuais retornados com sucesso.' })
  async getPlaybook(
    @Req() request: AuthenticatedRequest,
    @Query('squad') squad?: string,
  ): Promise<PlaybookOverviewResponse> {
    return this.trainingService.getPlaybook(request.user.sub, squad);
  }

  @Patch('toggle')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Marcar ou desmarcar item do próprio Checklist Individual ou item liberado do Squad',
  })
  @ApiResponse({ status: 200, description: 'Item atualizado e novo percentual calculado.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para alterar item de outro Squad.' })
  @ApiResponse({ status: 404, description: 'Item do Playbook não encontrado.' })
  async toggleChecklist(
    @Body() dto: ToggleChecklistDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<ToggleChecklistResponse> {
    return this.trainingService.toggleChecklist(request.user, dto);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Criar item do Playbook (Presidência / Diretoria)' })
  @ApiResponse({ status: 201, description: 'Item criado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado: permissão restrita à Diretoria.' })
  async createItem(
    @Body() createDto: CreatePlaybookItemDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PlaybookItem> {
    return this.trainingService.createItem(createDto, request.user);
  }

  @Patch('items/:id')
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Atualizar item do Playbook (Presidência / Diretoria)' })
  @ApiResponse({ status: 200, description: 'Item atualizado com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado: permissão restrita à Diretoria.' })
  @ApiResponse({ status: 404, description: 'Item do Playbook não encontrado.' })
  async updateItem(
    @Param('id') id: string,
    @Body() updateDto: UpdatePlaybookItemDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PlaybookItem> {
    return this.trainingService.updateItem(id, updateDto, request.user);
  }

  @Delete('items/:id')
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Remover item do Playbook (Presidência / Diretoria)' })
  @ApiResponse({ status: 200, description: 'Item removido com sucesso.' })
  @ApiResponse({ status: 403, description: 'Acesso negado: permissão restrita à Diretoria.' })
  @ApiResponse({ status: 404, description: 'Item do Playbook não encontrado.' })
  async removeItem(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<DeletePlaybookItemResponse> {
    return this.trainingService.removeItem(id, request.user);
  }
}
