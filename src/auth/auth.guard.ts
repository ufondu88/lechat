import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { JWTUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    try {
      const jwtUser: JWTUser = this.jwtService.decode(token);
      const { email } = jwtUser
      const user = await this.getUserFromEmail(email)

      request['user'] = user
    } catch (error) {
      throw new InternalServerErrorException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string {
    if (!request.headers.authorization) {
      throw new UnauthorizedException('No authorization header present');
    }

    const [type, token] = request.headers.authorization.split(' ') ?? [];

    if (type !== 'Bearer') throw new UnauthorizedException('No token present');

    return token
  }

  private async getUserFromEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email })
    if (!user) throw new UnauthorizedException('User does not exist')

    return user
  }
}
