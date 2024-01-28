import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';
import { BaseController } from '../helpers/classes/base.controller';
import { ChatroomService } from './chatroom.service';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';

@Controller('chatroom')
export class ChatroomController extends BaseController {
  constructor(private readonly chatroomService: ChatroomService) { super('ChatroomController') }

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  create(@Body('chatters') chatters: string[], @Req() req: Request) {
    this.logger.log(`Creating chatroom for ${req['community']['name']}`)

    return this.chatroomService.create(chatters);
  }

  @Get('user/:id')
  @UseGuards(ApiKeyAuthGuard)
  findAll(@Param('id') id: string) {
    return this.chatroomService.findByUserId(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatroomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatroomDto: UpdateChatroomDto) {
    return this.chatroomService.update(id, updateChatroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatroomService.remove(id);
  }
}
