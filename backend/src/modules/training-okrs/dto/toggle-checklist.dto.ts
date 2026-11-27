import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ToggleChecklistDto {
  @ApiProperty({ example: '66666666-6666-4666-8666-666666666661' })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'O identificador do item do Playbook deve ser um texto.' })
  @IsNotEmpty({ message: 'O identificador do item do Playbook é obrigatório.' })
  playbookItemId!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Se omitido, inverte o estado atual do item.',
  })
  @IsOptional()
  @IsBoolean({ message: 'O campo completed deve ser um booleano.' })
  completed?: boolean;
}
