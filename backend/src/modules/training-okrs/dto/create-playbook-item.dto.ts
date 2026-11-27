import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlaybookScope } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreatePlaybookItemDto {
  @ApiProperty({ example: 'Configurar Ambiente Docker-First do ERP' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O título deve ser um texto.' })
  @IsNotEmpty({ message: 'O título do item é obrigatório.' })
  title!: string;

  @ApiProperty({ example: 'Subir containers locais, rodar migrações e validar testes.' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'A descrição deve ser um texto.' })
  @IsNotEmpty({ message: 'A descrição do item é obrigatória.' })
  description!: string;

  @ApiProperty({ enum: PlaybookScope, example: PlaybookScope.INDIVIDUAL })
  @IsEnum(PlaybookScope, { message: 'O escopo deve ser INDIVIDUAL ou SQUAD.' })
  scope!: PlaybookScope;

  @ApiPropertyOptional({ example: 'Squad 2', nullable: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O squad alvo deve ser um texto.' })
  targetSquad?: string | null;

  @ApiProperty({ example: 1, minimum: 0 })
  @IsInt({ message: 'A ordem de exibição deve ser um número inteiro.' })
  @Min(0, { message: 'A ordem de exibição não pode ser negativa.' })
  orderIndex!: number;
}
