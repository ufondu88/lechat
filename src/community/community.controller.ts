import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';

@Controller('community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) { }

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createCommunityDto: CreateCommunityDto) {
    return this.communityService.create(createCommunityDto, userId);
  }

  @Get()
  findAll() {
    return this.communityService.findAll();
  }

  @Get('id/:id')
  findOne(@Param('id') id: string) {
    return this.communityService.findOneBy({id});
  }

  @Get('key/:key')
  findOneByApiKey(@Param('key') key: string) {
    return this.communityService.findOneByApiKey(key);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityDto: UpdateCommunityDto) {
    return this.communityService.update(id, updateCommunityDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityService.remove(id);
  }
}
