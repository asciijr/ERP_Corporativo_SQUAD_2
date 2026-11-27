import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, DirectorGuard, JwtAuthGuard } from '../auth';
import { DriveCardWithAuthor, DriveService } from './drive.service';
import { CreateDriveCardDto } from './dto/create-drive-card.dto';
import { ListDriveCardsQueryDto } from './dto/list-drive-cards-query.dto';
import { UpdateDriveCardDto } from './dto/update-drive-card.dto';

// Guards por rota, não na classe: a listagem fica aberta a qualquer membro logado,
// e só Presidência e Diretoria criam, editam ou removem cards.
@ApiTags('Drive')
@ApiBearerAuth()
@Controller('drive-cards')
export class DriveController {
  constructor(private readonly driveService: DriveService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar os cards do Drive, com busca por texto e filtro por categoria' })
  @ApiResponse({ status: 200, description: 'Cards do mais novo para o mais antigo.' })
  async findAll(@Query() query: ListDriveCardsQueryDto): Promise<DriveCardWithAuthor[]> {
    return this.driveService.findAll(query);
  }

  @Post()
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Cadastrar card do Drive (Presidência / Diretoria)' })
  @ApiResponse({ status: 201, description: 'Card criado e registrado na auditoria.' })
  @ApiResponse({ status: 403, description: 'Permissão restrita à Diretoria.' })
  async create(
    @Body() createDto: CreateDriveCardDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<DriveCardWithAuthor> {
    return this.driveService.create(createDto, request.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Editar card do Drive (Presidência / Diretoria)' })
  @ApiResponse({ status: 200, description: 'Card atualizado e registrado na auditoria.' })
  @ApiResponse({ status: 403, description: 'Permissão restrita à Diretoria.' })
  @ApiResponse({ status: 404, description: 'Card não encontrado.' })
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDriveCardDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<DriveCardWithAuthor> {
    return this.driveService.update(id, updateDto, request.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Remover card do Drive (Presidência / Diretoria)' })
  @ApiResponse({ status: 204, description: 'Card removido e registrado na auditoria.' })
  @ApiResponse({ status: 403, description: 'Permissão restrita à Diretoria.' })
  @ApiResponse({ status: 404, description: 'Card não encontrado.' })
  async remove(@Param('id') id: string, @Req() request: AuthenticatedRequest): Promise<void> {
    return this.driveService.remove(id, request.user);
  }
}
