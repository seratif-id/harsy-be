import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;
  // let ordersService: OrdersService;

  const mockOrdersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an order', async () => {
      const result = { id: 'uuid', total: 100 };
      const req = { user: { userId: 'user-uuid' } };
      mockOrdersService.create.mockResolvedValue(result);

      expect(
        await controller.create(req, { items: [], shippingAddress: {} } as any),
      ).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of orders', async () => {
      const result = [{ id: 'uuid', total: 100 }];
      const req = { user: { userId: 'user-uuid', role: 'customer' } };
      mockOrdersService.findAll.mockResolvedValue(result);

      expect(await controller.findAll(req)).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return an order', async () => {
      const result = { id: 'uuid', total: 100 };
      const req = { user: { userId: 'user-uuid', role: 'customer' } };
      mockOrdersService.findOne.mockResolvedValue(result);

      expect(await controller.findOne(req, 'uuid')).toBe(result);
    });
  });

  describe('updateStatus', () => {
    it('should update order status', async () => {
      const result = { id: 'uuid', status: 'SHIPPED' };
      mockOrdersService.updateStatus.mockResolvedValue(result);

      expect(await controller.updateStatus('uuid', 'SHIPPED')).toBe(result);
    });
  });
});
