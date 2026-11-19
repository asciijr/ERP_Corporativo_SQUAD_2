import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  AuthenticatedRequest,
  AuthMeResponse,
  LoginResponse,
  RegisterResponse,
} from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autenticar membro e emitir token JWT' })
  @ApiResponse({ status: 200, description: 'Autenticação realizada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas ou membro inativo.' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Autocadastro corporativo de novo membro da ASCII' })
  @ApiResponse({
    status: 201,
    description: 'Cadastro corporativo concluído com emissão de token JWT.',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou domínio de e-mail fora do padrão.' })
  @ApiResponse({ status: 409, description: 'E-mail, CPF ou matrícula UFU já cadastrados.' })
  async register(@Body() registerDto: RegisterDto): Promise<RegisterResponse> {
    return this.authService.register(registerDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retornar dados públicos e permissões do membro autenticado' })
  @ApiResponse({ status: 200, description: 'Dados públicos e flags de acesso retornados.' })
  @ApiResponse({ status: 401, description: 'Token JWT ausente, inválido ou expirado.' })
  async getMe(@Req() request: AuthenticatedRequest): Promise<AuthMeResponse> {
    return this.authService.getMe(request.user.sub);
  }
}
