import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthGuard } from './auth.guard';

// Mock createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;

  const USER_REPO_TOKEN = getRepositoryToken(User)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findOneByID: jest.fn(),
          }
        },
        {
          provide: AuthGuard,
          useValue: {
            decode: jest.fn()
          } 
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn()
          }
        }
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
