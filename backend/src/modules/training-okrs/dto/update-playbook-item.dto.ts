import { ApiPropertyOptional } from '@nestjs/swagger';
import { PlaybookScope } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlaybookItemDto {
  @ApiPropertyOptional({ example: 'Revisão de Arquitetura e Contratos Squad 2' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título do item não pode ser vazio.' })
  title?: string;

  @ApiPropertyOptional({ example: 'Validar fronteiras entre módulos e ADR-001.' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição do item não pode ser vazia.' })
  description?: string;

  @ApiPropertyOptional({ enum: PlaybookScope })
  @IsOptional()
  @IsEnum(PlaybookScope, { message: 'O escopo deve ser INDIVIDUAL ou SQUAD.' })
  scope?: PlaybookScope;

  @ApiPropertyOptional({ example: 'Squad 2', nullable: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O squad alvo deve ser um texto.' })
  targetSquad?: string | null;

  @ApiPropertyOptional({ example: 2, minimum: 0 })
  @IsOptional()
  @IsInt({ message: 'A ordem de exibição deve ser um número inteiro.' })
  @Min(0, { message: 'A ordem de exibição não pode ser negativa.' })
  orderIndex?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean({ message: 'O campo isCompleted deve ser um booleano.' })
  isCompleted?: boolean;
}
