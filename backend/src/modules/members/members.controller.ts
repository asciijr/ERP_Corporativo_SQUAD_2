import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthenticatedRequest, DirectorGuard, JwtAuthGuard } from '../auth';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { UpdateMyProfileDto } from './dto/update-my-profile.dto';
import { DetailedMember, MembersService, PublicMember } from './members.service';

@ApiTags('Members')
@ApiBearerAuth()
@Controller('members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar diretório público de membros da ASCII' })
  @ApiQuery({
    name: 'active',
    required: false,
    description: 'Filtrar apenas membros ativos (true/false)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista pública de membros retornada sem dados sensíveis.',
  })
  async findAll(@Query('active') active?: string): Promise<PublicMember[]> {
    const activeOnly = active === 'true' ? true : active === 'false' ? false : undefined;
    return this.membersService.findAll(activeOnly);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Atualizar dados pessoais do próprio perfil autenticado' })
  @ApiResponse({ status: 200, description: 'Perfil próprio atualizado com sucesso.' })
  async updateOwnProfile(
    @Req() request: AuthenticatedRequest,
    @Body() updateDto: UpdateMyProfileDto,
  ): Promise<DetailedMember> {
    return this.membersService.updateOwnProfile(request.user.sub, updateDto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Buscar detalhes de um membro pelo ID (ou "me")' })
  @ApiResponse({ status: 200, description: 'Dados do membro retornados.' })
  @ApiResponse({ status: 404, description: 'Membro não encontrado.' })
  async findOne(
    @Param('id') id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<PublicMember | DetailedMember> {
    const targetId = id === 'me' ? request.user.sub : id;
    return this.membersService.findDetailById(targetId, request.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({ summary: 'Cadastrar membro administrativamente (Presidência / Diretoria)' })
  @ApiResponse({ status: 201, description: 'Membro criado com sucesso.' })
  async create(
    @Body() createDto: CreateMemberDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<PublicMember> {
    return this.membersService.create(createDto, request.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, DirectorGuard)
  @ApiOperation({
    summary: 'Atribuir ou atualizar cargo, diretoria, squad, status e nível de acesso de um membro',
  })
  @ApiResponse({ status: 200, description: 'Atribuições do membro atualizadas com sucesso.' })
  @ApiResponse({ status: 403, description: 'Sem permissão para alterar cargo ou nível de acesso.' })
  async updateMemberRole(
    @Param('id') id: string,
    @Body() updateDto: UpdateMemberDto,
    @Req() request: AuthenticatedRequest,
  ): Promise<DetailedMember> {
    return this.membersService.updateMemberRole(id, updateDto, request.user);
  }
}
