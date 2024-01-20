import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from './entities/api-key.entity';
import { v4 as uuidv4 } from 'uuid';
import { Community } from 'src/community/entities/community.entity';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey)
    private readonly apiKeyRepo: Repository<ApiKey>,
  ) { }

  async generateAndSaveApiKey(community: Community): Promise<ApiKey> {
    let key: string
    let existingApiKey: ApiKey

    do {
      key = uuidv4();

      // Check if the API key already exists in the database
      existingApiKey = await this.apiKeyRepo.findOne({
        where: { key },
      });
    } while (existingApiKey);

    // If the key is unique, save it to the database
    const apiKey = this.apiKeyRepo.create({ key });

    apiKey.community = community
    
    await this.apiKeyRepo.save(apiKey);

    return apiKey;
  }

  findOneByValue(key: string) {    
    return this.apiKeyRepo.findOneBy({key})
  }
}
