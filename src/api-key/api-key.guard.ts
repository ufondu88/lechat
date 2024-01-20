import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from './api-key.service';

@Injectable()
export class ApiKeyAuthGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) { } // made up service for the point of the exmaple

  async canActivate(context: ExecutionContext): Promise < boolean > {
    const req = context.switchToHttp().getRequest();
    
    const apiKey = req.headers['x-api-key']

    if (!apiKey) {
      throw new UnauthorizedException('No API key present');
    }
    
    const key = await this.apiKeyService.findOneByValue(apiKey)
    
    if (!key) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true
  }
}
