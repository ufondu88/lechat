import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { Community } from '../community/entities/community.entity';
import { BaseController } from '../helpers/classes/base.controller';
import { ApiKey } from './entities/api-key.entity';

@Injectable()
export class ApiKeyService extends BaseController {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) { super('ApiKeyService') }

  apiKey() {
    return v4()
  }

  async createKey(community: Community): Promise<ApiKey> {
    try {
      const key = await this.generateApiKey()
      const apiKey = this.apiKeyRepo.create({ key });
      apiKey.community = community
      
      return this.apiKeyRepo.save(apiKey);
    } catch (error) {
      this.logger.error(`Error creating API key: ${error.message}`)
    }
  }

  findOneByValue(key: string) {
    return this.apiKeyRepo.findOneBy({ key })
  }

  async generateApiKey() {
    let key: string
    let existingApiKey: ApiKey

    do {
      key = this.apiKey();

      // Check if the API key already exists in the database
      existingApiKey = await this.apiKeyRepo.findOne({
        where: { key }
      });
    } while (existingApiKey);

    // Return unique key
    return key
  }
}
