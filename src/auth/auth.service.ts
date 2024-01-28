import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BaseSupabaseService } from '../helpers/classes/base.supabase.service';
import { handleError } from '../helpers/classes/error-handler.function';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserService } from '../user/user.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { RegistrationDto } from './dto/registration.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService extends BaseSupabaseService {
  constructor(private userService: UserService) {
    super('AuthService')
  }

  /**
   * Registers a new user to the system
   * 
   * @param registrationInfo - Information about the user to be registered
   * @returns A promise resolving to void or throwing an exception if the email already exists
  */
  async signUp(registrationInfo: RegistrationDto) {
    try {
      let { email, password } = registrationInfo;
      const { data, error } = await this.supabaseAuth.auth.signUp({ email, password })

      if (error) handleError(error)

      let { password: notNeeded, ...needed } = registrationInfo
      const id = data.user.id
      const user: CreateUserDto = { ...needed, id }

      return this.userService.create(user);
    } catch (error) {
      this.logger.error(`Error during signup: ${error.message}`)
    }
  }

  async batchSignUp(registrationInfos: RegistrationDto[]) {
    for (const info of registrationInfos) {
      console.log(await this.signUp(info));
    }
  }

  /**
   * Validates the user's credentials and returns the username
   * 
   * @param authCredentials - The user's authentication credentials
   * @returns A promise resolving to the username or throwing an exception if the credentials are invalid
  */
  async signInWithPassword(authCredentials: AuthCredentialsDto) {
    try {
      const { email, password } = authCredentials;
      const { data, error } = await this.supabaseAuth.auth.signInWithPassword({ email, password })

      if (error) handleError(error)

      return data
    } catch (error) {
      this.logger.error(`Error during signin: ${error.message}`)
    }
  }

  /**
   * Resets the password for a user based on the provided reset credentials.
   * 
   * @param resetCredentials - DTO containing information for resetting the password.
   * @returns A promise that resolves to the updated user information after the password reset.
   * @throws UnauthorizedException if the user is not found.
   */
  async resetPassword(resetCredentials: ResetPasswordDto) {
    try {
      // Get the email and new password from the reset credentials
      const { email, password } = resetCredentials;

      // Find the user in the database by email
      const currentUser = await this.userService.findOneByID(email);

      // If the user is not found, throw an error
      if (!currentUser) throw new UnauthorizedException('User not found');

      const { data: user, error } = await this.supabaseAuth.auth.admin.updateUserById(
        currentUser.id, { password }
      );

      if (error) handleError(error);

      return user;
    } catch (error) {
      this.logger.error(`Error during password reset: ${error.message}`);
    }
  }

  /**
   * Deletes a user based on the provided user ID.
   * 
   * @param id - User ID to delete.
   * @returns A promise that resolves to the result of the user deletion.
   */
  async deleteUser(id: string) {
    try {
      const { data, error } = await this.supabaseAuth.auth.admin.deleteUser(id);

      if (error) handleError(error);

      return data;
    } catch (error) {
      this.logger.error(`Error deleting user: ${error.message}`);
    }
  }

}
