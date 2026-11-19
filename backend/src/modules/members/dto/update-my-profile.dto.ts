import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';
import { ALLOWED_UNDERGRADUATE_COURSES } from '../../auth/dto/register.dto';

export class UpdateMyProfileDto {
  @ApiPropertyOptional({ example: 'Gabriel Ferreira' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome não pode ficar vazio.' })
  name?: string;

  @ApiPropertyOptional({ example: 'https://cdn.asciiej.com.br/avatar.png', nullable: true })
  @IsOptional()
  @IsString({ message: 'A URL do avatar deve ser uma string.' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: '34999994444' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'O telefone deve ser uma string.' })
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido com DDD (10 ou 11 dígitos).',
  })
  phone?: string;

  @ApiPropertyOptional({
    example: 'Bacharelado em Sistemas de Informação',
    enum: ALLOWED_UNDERGRADUATE_COURSES,
  })
  @IsOptional()
  @IsString()
  @IsIn(ALLOWED_UNDERGRADUATE_COURSES, {
    message:
      'O curso deve ser Bacharelado em Ciência da Computação ou Bacharelado em Sistemas de Informação.',
  })
  course?: string;

  @ApiPropertyOptional({ example: '5º Período' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  semester?: string;

  @ApiPropertyOptional({ type: [String], example: ['TypeScript', 'React', 'NestJS'] })
  @IsOptional()
  @IsArray({ message: 'As tags de proficiência devem ser enviadas em uma lista.' })
  @IsString({ each: true })
  skills?: string[];
}
