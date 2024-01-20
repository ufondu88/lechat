import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseController } from 'src/helpers/base.controller';

@Injectable()
export class UserService extends BaseController {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) { super('UserService') }

  async create(createUserDto: CreateUserDto) {
    let user = await this.userRepo.findOneBy({ name: createUserDto.name })
    
    if (user) {
      const userID = user.id

      this.logger.log(`user ${user.name} exists already. Updating...`)
      
      user.id = createUserDto.id

      await this.userRepo.update(userID, user)

      return
    } else {
      this.logger.log(`Creating user ${user.name}`)

      user = this.userRepo.create(createUserDto)
    }

    return this.userRepo.save(user)
  }

  findAll() {
    return this.userRepo.find()
  }

  findOneByEmail(email: string) {
    return this.userRepo.findOneBy({ email })
  }

  findOneByID(id: string) {
    return this.userRepo.findOneBy({ id })
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOneByID(id)


  }

  async refreshAll() {
    const users = await this.userRepo.find()

    users.forEach(async user => {
      await this.userRepo.save(user)
    })
  }

  async remove(id: string) {
    const result = await this.userRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`user with id "${id}" not found`)
    }
  }
}
