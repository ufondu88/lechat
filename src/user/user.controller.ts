import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseController } from 'src/helpers/base.controller';

@Controller('user')
export class UserController extends BaseController {
  constructor(private readonly userService: UserService) {
    super('UserService')
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`create user: ${createUserDto}`)

    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    this.logger.log('Getting all users')

    return this.userService.findAll();
  }

  @Get('id/:id')
  findOneByID(@Param('id') id: string) {
    this.logger.log(`Getting user by ID: ${id}`)

    return this.userService.findOneByID(id);
  }

  @Get('email/:email')
  findOneByEmail(@Param('email') email: string) {
    this.logger.log(`Getting user by email: ${email}`)

    return this.userService.findOneByEmail(email);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}\n${updateUserDto}`)

    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.warn(`Deleting user: ${id}`)

    return this.userService.remove(id);
  }
}
