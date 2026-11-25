import {
  ArgumentMetadata,
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { DRIVE_CARD_CATEGORIES } from '../drive.constants';
import { CreateDriveCardDto } from './create-drive-card.dto';
import { ListDriveCardsQueryDto } from './list-drive-cards-query.dto';
import { UpdateDriveCardDto } from './update-drive-card.dto';

// Same options as main.ts. The exceptionFactory only reports which fields failed,
// so each test proves the request was rejected for the expected reason.
const validationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) =>
    new BadRequestException(errors.map((error) => error.property).sort()),
});

type DtoClass = ArgumentMetadata['metatype'];

function runPipe(
  metatype: DtoClass,
  value: Record<string, unknown>,
  type: ArgumentMetadata['type'] = 'body',
): Promise<unknown> {
  return validationPipe.transform(value, { type, metatype });
}

async function rejectedFields(
  metatype: DtoClass,
  value: Record<string, unknown>,
  type: ArgumentMetadata['type'] = 'body',
): Promise<string[]> {
  try {
    await runPipe(metatype, value, type);
  } catch (error) {
    if (error instanceof BadRequestException) {
      // Nest wraps the array as { statusCode, message, error }.
      return (error.getResponse() as { message: string[] }).message;
    }
    throw error;
  }
  return [];
}

const validBody = {
  title: 'Atas das Reuniões Gerais',
  description: 'Atas e listas de presença das RGs de 2026/2.',
  driveUrl: 'https://drive.google.com/drive/folders/ascii-atas-rg',
  category: 'PRESIDENCIA',
};

const invalidCategories = ['Presidência', 'presidencia', 'MARKETING', ''];

const invalidDriveUrls = [
  'http://drive.google.com/drive/folders/ascii-atas-rg',
  'drive.google.com/drive/folders/ascii-atas-rg',
  'javascript:alert(1)',
  'não é um link',
  '',
];

describe('Drive card DTOs', () => {
  describe('DRIVE_CARD_CATEGORIES', () => {
    it('should list the category codes stored in the database', () => {
      expect([...DRIVE_CARD_CATEGORIES]).toEqual([
        'PRESIDENCIA',
        'RH',
        'FINANCEIRO',
        'PROJETOS',
        'COMERCIAL',
        'GERAL',
      ]);
    });
  });

  describe('CreateDriveCardDto', () => {
    it('should accept a valid body and trim text fields', async () => {
      const result = await runPipe(CreateDriveCardDto, {
        ...validBody,
        title: '  Atas das Reuniões Gerais  ',
        description: '  Atas e listas de presença das RGs de 2026/2.  ',
      });

      expect(result).toBeInstanceOf(CreateDriveCardDto);
      expect(result).toEqual(expect.objectContaining(validBody));
    });

    it.each(DRIVE_CARD_CATEGORIES)('should accept category %s', async (category) => {
      expect(await rejectedFields(CreateDriveCardDto, { ...validBody, category })).toEqual([]);
    });

    it.each(invalidCategories)('should reject category "%s"', async (category) => {
      expect(await rejectedFields(CreateDriveCardDto, { ...validBody, category })).toEqual([
        'category',
      ]);
    });

    it.each(invalidDriveUrls)('should reject driveUrl "%s"', async (driveUrl) => {
      expect(await rejectedFields(CreateDriveCardDto, { ...validBody, driveUrl })).toEqual([
        'driveUrl',
      ]);
    });

    it.each(['title', 'description'])('should reject empty or blank %s', async (field) => {
      expect(await rejectedFields(CreateDriveCardDto, { ...validBody, [field]: '' })).toEqual([
        field,
      ]);
      expect(await rejectedFields(CreateDriveCardDto, { ...validBody, [field]: '   ' })).toEqual([
        field,
      ]);
    });

    it('should reject a body without the required fields', async () => {
      expect(await rejectedFields(CreateDriveCardDto, {})).toEqual([
        'category',
        'description',
        'driveUrl',
        'title',
      ]);
    });

    it('should reject createdById in the body (author comes from the JWT)', async () => {
      expect(
        await rejectedFields(CreateDriveCardDto, {
          ...validBody,
          createdById: '99999999-9999-4999-8999-999999999999',
        }),
      ).toEqual(['createdById']);
    });
  });

  describe('UpdateDriveCardDto', () => {
    it('should accept a partial body and trim text fields', async () => {
      const result = await runPipe(UpdateDriveCardDto, { title: '  Novo título  ' });

      expect(result).toBeInstanceOf(UpdateDriveCardDto);
      expect(result).toEqual(expect.objectContaining({ title: 'Novo título' }));
    });

    it('should reject an invalid category', async () => {
      expect(await rejectedFields(UpdateDriveCardDto, { category: 'Presidência' })).toEqual([
        'category',
      ]);
    });

    it('should reject an invalid driveUrl', async () => {
      expect(await rejectedFields(UpdateDriveCardDto, { driveUrl: 'javascript:alert(1)' })).toEqual(
        ['driveUrl'],
      );
    });

    it.each(['title', 'description'])('should reject blank %s', async (field) => {
      expect(await rejectedFields(UpdateDriveCardDto, { [field]: '   ' })).toEqual([field]);
    });

    it('should reject createdById in the body', async () => {
      expect(
        await rejectedFields(UpdateDriveCardDto, {
          createdById: '99999999-9999-4999-8999-999999999999',
        }),
      ).toEqual(['createdById']);
    });
  });

  describe('ListDriveCardsQueryDto', () => {
    it('should accept an empty query', async () => {
      expect(await rejectedFields(ListDriveCardsQueryDto, {}, 'query')).toEqual([]);
    });

    it('should accept search and category together', async () => {
      const result = await runPipe(
        ListDriveCardsQueryDto,
        { search: 'contrato', category: 'FINANCEIRO' },
        'query',
      );

      expect(result).toEqual(
        expect.objectContaining({ search: 'contrato', category: 'FINANCEIRO' }),
      );
    });

    it('should turn an empty category into no filter ("Todas" in the screen)', async () => {
      const result = (await runPipe(
        ListDriveCardsQueryDto,
        { category: '' },
        'query',
      )) as ListDriveCardsQueryDto;

      expect(result.category).toBeUndefined();
    });

    it('should reject an invalid category', async () => {
      expect(
        await rejectedFields(ListDriveCardsQueryDto, { category: 'presidencia' }, 'query'),
      ).toEqual(['category']);
    });

    it('should reject a repeated search parameter', async () => {
      expect(
        await rejectedFields(ListDriveCardsQueryDto, { search: ['ata', 'contrato'] }, 'query'),
      ).toEqual(['search']);
    });

    it('should reject unknown query parameters', async () => {
      expect(await rejectedFields(ListDriveCardsQueryDto, { page: '1' }, 'query')).toEqual([
        'page',
      ]);
    });
  });
});
