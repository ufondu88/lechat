import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseController } from '../helpers/classes/base.controller';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends BaseController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { super('UserService') }

  /**
   * Creates a new user or updates an existing one based on the provided DTO.
   *
   * @param createUserDto - DTO containing information for creating or updating a user.
   * @returns Promise<void> if updating an existing user, otherwise Promise<User> for a newly created user.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // check if user exists
      this.logger.log(`Looking for user: ${createUserDto.name}`)

      let user = await this.userRepo.findOneBy({ name: createUserDto.name });

      if (user) {
        this.logger.log(`User ${user.name} exists already. Updating...`);

        user.id = createUserDto.id;
      } else {
        this.logger.log(`Creating user ${createUserDto.name}`);

        user = this.userRepo.create(createUserDto);
      }

      return this.userRepo.save(user);
    } catch (error) {
      this.logger.error(`Error creating user: ${error.message}`);

      throw error
    }
  }

  /**
   * Retrieves all users.
   *
   * @returns Array of users.
   */
  findAll(): Promise<User[]> {
    this.logger.log(`Getting all users`)

    return this.userRepo.find();
  }

  /**
   * Retrieves a user based on the provided email.
   *
   * @param email - Email to find the user.
   * @returns The found user or undefined if not found.
   */
  findOneByEmail(email: string): Promise<User> {
    this.logger.log(`Looking for user by email: ${email}`)

    return this.userRepo.findOneBy({ email });
  }

  /**
   * Retrieves a user based on the provided ID.
   *
   * @param id - User ID to find.
   * @returns The found user or undefined if not found.
   */
  async findOneByID(id: string): Promise<User> {
    this.logger.log(`Looking for user by id: ${id}`)

    return await this.userRepo.findOneBy({ id });
  }

  /**
   * Updates an existing user based on the provided ID and DTO.
   *
   * @param id - User ID to update.
   * @param updateUserDto - DTO containing information to update the user.
   * @returns The updated user or throws a NotFoundException if the user is not found.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.findOneByID(id);

      if (!user) throw new NotFoundException(`User with ID "${id}" not found`);

      user.id = updateUserDto.id
      user.email = updateUserDto.email
      user.name = updateUserDto.name
      user.telephone = updateUserDto.telephone

      this.logger.log(`Updating user: ${user}`)

      return this.userRepo.save(user);
    } catch (error) {
      this.logger.error(`Error updating user: ${error.message}`);

      throw error
    }
  }

  /**
   * Refreshes all users by saving them back to the database.
   *
   * @returns Promise<void>.
   */
  async refreshAll(): Promise<void> {
    const users = await this.userRepo.find();

    await Promise.all(users.map(async (user) => await this.userRepo.save(user)));
  }

  /**
   * Removes a user based on the provided ID.
   *
   * @param id - User ID to remove.
   * @returns Promise<void> or throws a NotFoundException if the user is not found.
   */
  async remove(id: string): Promise<string> {
    try {
      this.logger.log(`Removing user with id: ${id}`)

      const result = await this.userRepo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }

      return `User with ID "${id}" deleted successfully`
    } catch (error) {
      this.logger.error(`Error removing user: ${error.message}`);
    }
  }

}
