import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { DRIVE_CARD_CATEGORIES, DriveCardCategory } from '../drive.constants';

export class ListDriveCardsQueryDto {
  @ApiPropertyOptional({
    example: 'ata',
    description: 'Busca no título e na descrição, sem diferenciar maiúsculas.',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: DRIVE_CARD_CATEGORIES,
    description: 'Filtra por categoria. Vazio ou ausente lista todas.',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === '' ? undefined : value))
  @IsIn([...DRIVE_CARD_CATEGORIES])
  category?: DriveCardCategory;
}
