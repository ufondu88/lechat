import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'src/user/entities/role.enum';
import { ROLES_KEY } from './decorators/auth.metadata';
import { JWTUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true
    }

    const request = context.switchToHttp().getRequest();

    // Remove "Bearer " from the authorization string
    const token = (request.headers.authorization).slice(7);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const user: JWTUser = this.jwtService.decode(token);

      // is at least one of the required roles a role that the user has
      const userHasRequiredRoles = requiredRoles.some(role => {
        return user.roles.includes(role)
      })

      if (!userHasRequiredRoles) {
        throw new UnauthorizedException('user does not have correct role access')
      }
    } catch (error) {
      throw new InternalServerErrorException();
    }

    return true;
  }
}
