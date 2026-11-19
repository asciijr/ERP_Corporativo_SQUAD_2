import { ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateMemberDto {
  @ApiPropertyOptional({ example: 'Tech Lead Squad 2' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  roleTitle?: string;

  @ApiPropertyOptional({ example: 'PROJETOS' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  department?: string;

  @ApiPropertyOptional({ example: 'Squad 2', nullable: true })
  @IsOptional()
  @IsString()
  squadName?: string | null;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: AccessLevel })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiPropertyOptional({ example: 'Bacharelado em Ciência da Computação', nullable: true })
  @IsOptional()
  @IsString()
  course?: string | null;

  @ApiPropertyOptional({ example: '6º Período', nullable: true })
  @IsOptional()
  @IsString()
  semester?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}
