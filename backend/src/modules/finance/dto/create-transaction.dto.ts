import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  MaxLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTransactionDto {
  @ApiProperty({ enum: TransactionType, example: TransactionType.INCOME })
  @IsEnum(TransactionType, { message: 'type deve ser INCOME ou EXPENSE' })
  type!: TransactionType;

  @ApiProperty({
    example: 1500.5,
    description: 'Valor sempre positivo, com até 2 casas decimais. O sentido é definido por type.',
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount deve ser numérico com até 2 casas' })
  @IsPositive({ message: 'amount deve ser maior que zero' })
  @Max(9999999999.99)
  amount!: number;

  @ApiProperty({ example: 'Projetos' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  category!: string;

  @ApiProperty({ example: 'Pagamento da 1ª parcela do projeto X' })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  description!: string;

  @ApiProperty({ example: '2026-11-20', description: 'Data ISO 8601 (YYYY-MM-DD ou completa)' })
  @IsDateString({}, { message: 'transactionDate deve ser uma data ISO 8601 válida' })
  transactionDate!: string;
}
