import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  // let reviewsService: ReviewsService;

  const mockReviewsService = {
    create: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a review', async () => {
      const result = { id: 'uuid', rating: 5 };
      const req = { user: { userId: 'user-uuid' } };
      mockReviewsService.create.mockResolvedValue(result);

      expect(
        await controller.create(req, {
          productId: 'uuid',
          rating: 5,
          comment: 'Great',
        }),
      ).toBe(result);
    });
  });

  describe('findAll', () => {
    it('should return an array of reviews', async () => {
      const result = [{ id: 'uuid', rating: 5 }];
      mockReviewsService.findAll.mockResolvedValue(result);

      expect(await controller.findAll('uuid')).toBe(result);
    });
  });
});
