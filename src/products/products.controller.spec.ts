import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  // let productsService: ProductsService;

  const mockProductsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const result = { id: 'uuid', name: 'Product 1' };
      mockProductsService.create.mockResolvedValue(result);

      expect(await controller.create({ name: 'Product 1' } as any)).toBe(
        result,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const result = [{ id: 'uuid', name: 'Product 1' }];
      mockProductsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a product', async () => {
      const result = { id: 'uuid', name: 'Product 1' };
      mockProductsService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('uuid')).toBe(result);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const result = { id: 'uuid', name: 'Product 1 Updated' };
      mockProductsService.update.mockResolvedValue(result);

      expect(
        await controller.update('uuid', { name: 'Product 1 Updated' }),
      ).toBe(result);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const result = { id: 'uuid', name: 'Product 1' };
      mockProductsService.remove.mockResolvedValue(result);

      expect(await controller.remove('uuid')).toBe(result);
    });
  });
});
