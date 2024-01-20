import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { handleError } from 'src/helpers/error-handler.function';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UserService } from 'src/user/user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegistrationDto } from './dto/registration.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { BaseSupabaseService } from 'src/helpers/base.supabase.service';

@Injectable()
export class AuthService extends BaseSupabaseService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) { 
    super('AuthService')
  }

  /**
    Registers a new user to the system
    @param registrationInfo - Information about the user to be registered
    @returns A promise resolving to void or throwing an exception if the email or username already exists
  */
  async signUp(registrationInfo: RegistrationDto) {
    const { email, password } = registrationInfo;

    const { data, error } = await this.supabaseAuth.auth.signUp({ email, password })

    if (error) {
      handleError(error)
    }

    delete registrationInfo.password
    
    const id = data.user.id

    const user: CreateUserDto = { ...registrationInfo, id }

    return this.userService.create(user);
  }

  async batchSignUp(registrationInfos: RegistrationDto[]) {
    for (const info of registrationInfos) {
      console.log(await this.signUp(info));
    }
  }

  /**
    Validates the user's credentials and returns the username
    @param authCredentials - The user's authentication credentials
    @returns A promise resolving to the username or throwing an exception if the credentials are invalid
  */
  async signInWithPassword(authCredentials: AuthCredentialsDto) {
    const { email, password } = authCredentials;

    const { data, error } = await this.supabaseAuth.auth.signInWithPassword({ email, password })

    if (error) {
      handleError(error)
    }

    return data
  }

  async resetPassword(resetCredentials: ResetPasswordDto) {
    // Get the email and new password from the reset credentials
    const { email, password } = resetCredentials;

    // Find the user in the database by email
    const currentUser = await this.userService.findOneByID(email);

    // If the user is not found, throw an error
    if (!currentUser) throw new UnauthorizedException('User not found');

    const { data: user, error } = await this.supabaseAuth.auth.admin.updateUserById(
      currentUser.id, { password }
    )

    if (error) {
      handleError(error)
    }

    return user
  }

  async deleteUser(id: string) {
    const { data, error } = await this.supabaseAuth.auth.admin.deleteUser(id)

    if (error) {
      handleError(error)
    }

    return data
  }
}
