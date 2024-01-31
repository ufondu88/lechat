import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Repository<User>;
  let spyLoggerError: jest.SpyInstance

  const USER_REPO_TOKEN = getRepositoryToken(User)

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: USER_REPO_TOKEN,
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            delete: jest.fn(),
          },
        },

      ],
    }).compile();

    service = module.get(UserService);
    userRepository = module.get(getRepositoryToken(User));
    spyLoggerError = jest.spyOn(service.logger, 'error');
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
      jest.spyOn(userRepository, 'create').mockReturnValueOnce(createUserDto as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(createUserDto as User);

      const result = await service.create(createUserDto);
      expect(result).toEqual(createUserDto);
    });

    it('should update an existing user', async () => {
      const createUserDto = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        telephone: '123456789',
      };

      jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(createUserDto as User);
      jest.spyOn(userRepository, 'save').mockResolvedValueOnce(createUserDto as User);

      const result = await service.create(createUserDto);
      expect(result).toEqual(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const findSpy = jest.spyOn(userRepository, 'find')

      const result = await service.findAll();

      expect(findSpy).toHaveBeenCalled();
      expect(result).toEqual(expect.arrayContaining<User>([]))
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user by email if user exists', async () => {
      const email = 'test@example.com';
      const user = {email} as User
      const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user)

      await service.findOneBy({email});

      expect(findOneBySpy).toHaveBeenCalledWith({ email });
    });

    it('should return undefined if user does not exist', async () => {
      const email = 'test@example.com';
      const findOneBySpy = jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined)

      const result = await service.findOneBy({email});

      expect(findOneBySpy).toHaveBeenCalledWith({ email });
      expect(result).not.toBeDefined()
    });
  });

  describe('update', () => {
    const id = '1'
    const updateUserDto: UpdateUserDto = {
      name: 'user name',
    };
    const user = { id: '1', isAdmin: true } as User

    it('should update and return user', async () => {
      jest.spyOn(service, 'findOneBy').mockResolvedValue(user)
      jest.spyOn(userRepository, 'save').mockResolvedValue(user)

      const result = await service.update(id, updateUserDto)

      expect(result).toEqual(user)
    })

    it('should throw NotFoundException if user is not found', async () => {
      jest.spyOn(service, 'findOneBy').mockResolvedValue(undefined)
      const saveSpy = jest.spyOn(userRepository, 'save')

      try {
        await service.update(id, updateUserDto)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }

      expect(saveSpy).not.toHaveBeenCalled();
    })
  });

  describe('remove', () => {
    const id = '1'

    it('should delete user and return confirmation', async () => {
      const deleteResult = { affected: 1, raw: 0 }

      jest.spyOn(service, 'remove')
      jest.spyOn(userRepository, 'delete').mockResolvedValue(deleteResult)

      const result = await service.remove(id)

      expect(result).toContain('success')
    })

    it('should throw NotFoundException if user is not found', async () => {
      const deleteResult = { affected: 0, raw: 0 }

      jest.spyOn(userRepository, 'delete').mockResolvedValue(deleteResult)

      try {
        await service.remove(id)
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toContain("not found")
        expect(spyLoggerError).toHaveBeenCalledWith(expect.stringContaining("Error"));
      }
    })
  })
})