import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { UpdateChatroomDto } from './dto/update-chatroom.dto';
import { ApiKeyAuthGuard } from 'src/api-key/api-key.guard';

@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  create(@Body('chatters') chatters: string[], @Req() req: Request) {    
    return this.chatroomService.create(chatters);
  }

  @Get('user/:id')
  @UseGuards(ApiKeyAuthGuard)
  findAll(@Param('id') id: string) {
    return this.chatroomService.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatroomService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatroomDto: UpdateChatroomDto) {
    return this.chatroomService.update(+id, updateChatroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatroomService.remove(+id);
  }
}
