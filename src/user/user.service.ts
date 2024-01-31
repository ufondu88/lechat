import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdaterService } from '../helpers/classes/updater.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService extends UpdaterService<User, UpdateUserDto> {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { super('UserService', 'user', userRepo) }

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
   * Refreshes all users by saving them back to the database.
   *
   * @returns Promise<void>.
   */
  async refreshAll(): Promise<void> {
    const users = await this.userRepo.find();

    await Promise.all(users.map(async (user) => await this.userRepo.save(user)));
  }
}
