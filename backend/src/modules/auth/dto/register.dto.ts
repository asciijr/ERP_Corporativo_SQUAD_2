import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export const ALLOWED_UNDERGRADUATE_COURSES = [
  'Bacharelado em Ciência da Computação',
  'Bacharelado em Sistemas de Informação',
] as const;

export class RegisterDto {
  @ApiProperty({ example: 'Luís Fellipe Pereira Melo' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O nome deve ser uma string.' })
  @IsNotEmpty({ message: 'O nome completo é obrigatório.' })
  name!: string;

  @ApiProperty({ example: 'luis.melo@asciiej.com.br' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Informe um e-mail corporativo válido.' })
  @Matches(/@asciiej\.com\.br$/i, {
    message: 'O e-mail corporativo deve pertencer ao domínio @asciiej.com.br.',
  })
  email!: string;

  @ApiProperty({ example: 'luis.melo@ufu.br' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'Informe um e-mail institucional da UFU válido.' })
  @Matches(/@ufu\.br$/i, {
    message: 'O e-mail institucional da UFU deve pertencer ao domínio @ufu.br.',
  })
  ufuEmail!: string;

  @ApiProperty({ example: 'Ascii@2026', minLength: 6 })
  @IsString({ message: 'A senha deve ser uma string.' })
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
  password!: string;

  @ApiProperty({ example: '2003-05-14' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'A data de aniversário é obrigatória.' })
  @IsNotEmpty({ message: 'A data de aniversário é obrigatória.' })
  birthDate!: string;

  @ApiProperty({ example: '34999998888' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'O telefone é obrigatório.' })
  @Matches(/^\d{10,11}$/, {
    message: 'Informe um telefone válido com DDD (10 ou 11 dígitos).',
  })
  phone!: string;

  @ApiProperty({ example: '12345678901' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value,
  )
  @IsString({ message: 'O CPF é obrigatório.' })
  @Matches(/^\d{11}$/, {
    message: 'Informe um CPF válido com exatamente 11 dígitos.',
  })
  cpf!: string;

  @ApiProperty({ example: '12111BCC001' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'A matrícula UFU é obrigatória.' })
  @IsNotEmpty({ message: 'A matrícula UFU é obrigatória.' })
  ufuRegistration!: string;

  @ApiProperty({
    example: 'Bacharelado em Ciência da Computação',
    enum: ALLOWED_UNDERGRADUATE_COURSES,
  })
  @IsString({ message: 'O curso de graduação é obrigatório.' })
  @IsIn(ALLOWED_UNDERGRADUATE_COURSES, {
    message:
      'O curso deve ser Bacharelado em Ciência da Computação ou Bacharelado em Sistemas de Informação.',
  })
  course!: string;
}
