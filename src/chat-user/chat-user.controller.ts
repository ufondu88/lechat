import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { ApiKeyAuthGuard } from '../api-key/api-key.guard';
import { ChatUserService } from './chat-user.service';
import { CreateChatUserDto } from './dto/create-chat-user.dto';
import { UpdateChatUserDto } from './dto/update-chat-user.dto';

@Controller('chat-user')
export class ChatUserController {
  constructor(private readonly chatUserService: ChatUserService) { }

  @Post()
  @UseGuards(ApiKeyAuthGuard)
  create(@Body() createChatUserDto: CreateChatUserDto, @Req() req: Request) {
    const apiKey = req.headers['x-api-key']

    return this.chatUserService.create(createChatUserDto, apiKey);
  }

  @Get()
  findAll() {
    return this.chatUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatUserService.findOneBy({id});
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatUserDto: UpdateChatUserDto) {
    return this.chatUserService.update(id, updateChatUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatUserService.remove(id);
  }
}
