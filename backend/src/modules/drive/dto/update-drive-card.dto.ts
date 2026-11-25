import { PartialType } from '@nestjs/swagger';
import { CreateDriveCardDto } from './create-drive-card.dto';

/** Mesmas regras do cadastro, com todos os campos opcionais. O autor nunca muda. */
export class UpdateDriveCardDto extends PartialType(CreateDriveCardDto) {}
