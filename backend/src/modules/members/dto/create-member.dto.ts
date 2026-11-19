import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccessLevel } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({ example: 'Beatriz Costa' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'beatriz.costa@asciiej.com.br' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Ascii@2026', minLength: 6 })
  @IsString()
  @MinLength(6)
  password!: string;

  @ApiProperty({ example: 'Desenvolvedora Frontend' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  roleTitle!: string;

  @ApiProperty({ example: 'PROJETOS' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  department!: string;

  @ApiPropertyOptional({ enum: AccessLevel, default: AccessLevel.MEMBRO })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiPropertyOptional({ example: 'Bacharelado em Ciência da Computação' })
  @IsOptional()
  @IsString()
  course?: string | null;

  @ApiPropertyOptional({ example: '5º Período' })
  @IsOptional()
  @IsString()
  semester?: string | null;

  @ApiPropertyOptional({ example: 'Squad 2' })
  @IsOptional()
  @IsString()
  squadName?: string | null;

  @ApiPropertyOptional({ type: [String], example: ['React', 'TypeScript'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  ufuEmail?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  birthDate?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString()
  cpf?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ufuRegistration?: string | null;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
