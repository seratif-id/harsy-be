import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  // let categoriesService: CategoriesService;

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const result = { id: 'uuid', name: 'Cat 1' };
      mockCategoriesService.create.mockResolvedValue(result);

      expect(await controller.create({ name: 'Cat 1' } as any)).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of categories', async () => {
      const result = [{ id: 'uuid', name: 'Cat 1' }];
      mockCategoriesService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a category', async () => {
      const result = { id: 'uuid', name: 'Cat 1' };
      mockCategoriesService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('uuid')).toBe(result);
    });
  });
});
