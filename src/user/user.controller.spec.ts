import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const createUserDto: CreateUserDto = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    telephone: '1234567890',
  };

  const updateUserDto: UpdateUserDto = {
    name: 'Updated Name',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOneByID: jest.fn(),
            findOneByEmail: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(createUserDto as User);

      const result = await controller.create(createUserDto);

      expect(service.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should retrieve all users', async () => {
      const users = [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
      ] as User[];

      jest.spyOn(service, 'findAll').mockResolvedValue(users);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });

  describe('findOneByID', () => {
    it('should retrieve a user by ID', async () => {
      const userId = '1';
      const user = { id: userId, name: 'John Doe', email: 'john@example.com' } as User;

      jest.spyOn(service, 'findOneByID').mockResolvedValue(user);

      const result = await controller.findOneByID(userId);

      expect(service.findOneByID).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });
  });

  describe('findOneByEmail', () => {
    it('should retrieve a user by email', async () => {
      const email =  'john@example.com'
      const user = { email } as User;

      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(user);

      const result = await controller.findOneByEmail(email);

      expect(service.findOneByEmail).toHaveBeenCalledWith(email);
      expect(result).toEqual(user);
    });
  });

  describe('update', () => {
    it('should update a user by ID', async () => {
      const id = '1';
      const user = { id } as User;

      jest.spyOn(service, 'update').mockResolvedValue(user);

      const result = await controller.update(id, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
      expect(result).toEqual(user);
    });
  });

  describe('remove', () => {
    it('should remove a user by ID', async () => {
      const id = '1';

      jest.spyOn(service, 'remove').mockResolvedValue('success');

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
      expect(result).toContain('success');
    });
  });
});
