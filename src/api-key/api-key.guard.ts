import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommunityService } from '../community/community.service';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(
    private readonly apiKeyService: ApiKeyService,
    private readonly communityService: CommunityService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    const apiKey: string = req.headers['x-api-key']

    if (!apiKey) {
      throw new UnauthorizedException('No API key present');
    }

    const key = await this.apiKeyService.findOneByValue(apiKey)

    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!key.upToDate) {
      throw new UnauthorizedException('Key is not up to date');
    }

    const community = await this.communityService.findOneByApiKey(key.key)

    if (!community) {
      throw new NotFoundException('API key does not belong to a community')
    }

    req['community'] = community

    return true
  }
}
