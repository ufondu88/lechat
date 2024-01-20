import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { JWTUser } from '../interfaces/jwt-payload.interface';

@Injectable()
export class SupabaseStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SUPABASE_JWT_SECRET
    });
  }

  async validate(jwtUser: JWTUser): Promise<User> {
    const { email } = jwtUser

    const user = await this.userRepository.findOneBy({ email })

    if (!user) {
      throw new UnauthorizedException()
    }

    return user
  }
}