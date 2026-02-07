import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  // let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    validateUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return a token', async () => {
      const result = { data: { accessToken: 'token', user: {} as any } };
      const user = { id: 1, email: 'test@example.com' };
      mockAuthService.validateUser.mockResolvedValue(user);
      mockAuthService.login.mockResolvedValue(result);

      expect(await controller.login({} as any)).toBe(result);
    });
  });

  describe('register', () => {
    it('should create a user and return token', async () => {
      const result = { data: { accessToken: 'token', user: {} as any } };
      mockAuthService.register.mockResolvedValue(result);

      expect(await controller.register({} as any)).toBe(result);
    });
  });
});
