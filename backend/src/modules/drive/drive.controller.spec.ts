import { HttpStatus, RequestMethod } from '@nestjs/common';
import {
  GUARDS_METADATA,
  HTTP_CODE_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { Test, TestingModule } from '@nestjs/testing';
import { AccessLevel } from '@prisma/client';
import { AuthenticatedRequest, DirectorGuard, JwtAuthGuard, JwtPayload } from '../auth';
import { CreateDriveCardDto } from './dto/create-drive-card.dto';
import { DriveController } from './drive.controller';
import { DriveService } from './drive.service';

describe('DriveController', () => {
  let driveController: DriveController;
  let driveService: {
    findAll: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const director: JwtPayload = {
    sub: '33333333-3333-4333-8333-333333333333',
    email: 'projetos@asciiej.com.br',
    systemRole: AccessLevel.DIRETOR,
    roleTitle: 'Diretor de Projetos',
    department: 'PROJETOS',
  };

  const request = { user: director } as AuthenticatedRequest;

  const createDto: CreateDriveCardDto = {
    title: 'Atas das Reuniões Gerais',
    description: 'Atas e listas de presença das RGs de 2026/2.',
    driveUrl: 'https://drive.google.com/drive/folders/ascii-atas-rg',
    category: 'PRESIDENCIA',
  };

  const cardId = '55555555-5555-4555-8555-555555555553';

  beforeEach(async () => {
    driveService = {
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriveController],
      providers: [{ provide: DriveService, useValue: driveService }],
    }).compile();

    driveController = module.get<DriveController>(DriveController);
  });

  describe('routes', () => {
    it('should be mounted at /drive-cards', () => {
      expect(Reflect.getMetadata(PATH_METADATA, DriveController)).toBe('drive-cards');
    });

    it.each([
      ['findAll', RequestMethod.GET, '/'],
      ['create', RequestMethod.POST, '/'],
      ['update', RequestMethod.PATCH, ':id'],
      ['remove', RequestMethod.DELETE, ':id'],
    ] as const)(
      '%s should be mapped to the expected HTTP method and path',
      (handler, method, path) => {
        const route = DriveController.prototype[handler];

        expect(Reflect.getMetadata(METHOD_METADATA, route)).toBe(method);
        expect(Reflect.getMetadata(PATH_METADATA, route)).toBe(path);
      },
    );

    it('DELETE /drive-cards/:id should respond 204 No Content', () => {
      expect(Reflect.getMetadata(HTTP_CODE_METADATA, DriveController.prototype.remove)).toBe(
        HttpStatus.NO_CONTENT,
      );
    });
  });

  describe('guards', () => {
    it('should not declare guards at class level, so GET stays open to MEMBRO', () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, DriveController)).toBeUndefined();
    });

    it('GET /drive-cards should require only JwtAuthGuard', () => {
      expect(Reflect.getMetadata(GUARDS_METADATA, DriveController.prototype.findAll)).toEqual([
        JwtAuthGuard,
      ]);
    });

    it.each(['create', 'update', 'remove'] as const)(
      '%s should require JwtAuthGuard and DirectorGuard, blocking MEMBRO',
      (handler) => {
        expect(Reflect.getMetadata(GUARDS_METADATA, DriveController.prototype[handler])).toEqual([
          JwtAuthGuard,
          DirectorGuard,
        ]);
      },
    );
  });

  describe('delegation to DriveService', () => {
    it('findAll should pass the query filters to the service', async () => {
      driveService.findAll.mockResolvedValue([]);
      const query = { search: 'ata', category: 'PRESIDENCIA' as const };

      const result = await driveController.findAll(query);

      expect(result).toEqual([]);
      expect(driveService.findAll).toHaveBeenCalledWith(query);
    });

    it('create should pass the body and request.user to the service', async () => {
      await driveController.create(createDto, request);

      expect(driveService.create).toHaveBeenCalledWith(createDto, director);
    });

    it('update should pass the id, the body and request.user to the service', async () => {
      await driveController.update(cardId, { title: 'Novo título' }, request);

      expect(driveService.update).toHaveBeenCalledWith(cardId, { title: 'Novo título' }, director);
    });

    it('remove should pass the id and request.user to the service', async () => {
      await driveController.remove(cardId, request);

      expect(driveService.remove).toHaveBeenCalledWith(cardId, director);
    });
  });
});
