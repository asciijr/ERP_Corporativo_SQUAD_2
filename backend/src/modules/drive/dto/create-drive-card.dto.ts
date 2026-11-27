import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { DRIVE_CARD_CATEGORIES, DriveCardCategory } from '../drive.constants';

export class CreateDriveCardDto {
  @ApiProperty({ example: 'Atas das Reuniões Gerais' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Atas e listas de presença das RGs de 2026/2.' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    example: 'https://drive.google.com/drive/folders/ascii-atas-rg',
    description: 'Link da pasta ou do arquivo no Google Drive (somente https).',
  })
  @IsUrl({ protocols: ['https'], require_protocol: true })
  driveUrl!: string;

  @ApiProperty({ enum: DRIVE_CARD_CATEGORIES, example: 'PRESIDENCIA' })
  @IsIn([...DRIVE_CARD_CATEGORIES])
  category!: DriveCardCategory;
}
