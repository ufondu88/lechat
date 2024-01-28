import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { createClient as createClientMock } from "@supabase/supabase-js";

// Mock createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;

  // Mock values for SUPABASE_URL and SUPABASE_SERVICE_KEY
  const mockSupabaseUrl = 'mock-supabase-url';
  const mockSupabaseServiceKey = 'mock-supabase-service-key';

  // Setup before each test
  beforeEach(async () => {
    process.env.SUPABASE_URL = mockSupabaseUrl;
    process.env.SUPABASE_SERVICE_KEY = mockSupabaseServiceKey;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findOneByID: jest.fn()
          }
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  // Cleanup after each test
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });
});