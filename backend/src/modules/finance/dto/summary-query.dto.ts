import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

export class SummaryQueryDto {
  @ApiPropertyOptional({
    example: 2026,
    description: 'Ano de referência. Padrão: ano atual.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({
    example: 11,
    minimum: 1,
    maximum: 12,
    description: 'Filtra um único mês. Não pode ser combinado com semester.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({
    example: 2,
    enum: [1, 2],
    description: '1 = jan–jun, 2 = jul–dez. Não pode ser combinado com month.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn([1, 2])
  semester?: 1 | 2;
}
