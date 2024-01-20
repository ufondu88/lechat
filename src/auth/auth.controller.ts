import { Controller, Post, Body, ValidationPipe, Res, UseGuards, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaseController } from 'src/helpers/base.controller';
import { RegistrationDto } from './dto/registration.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController extends BaseController {
  
  constructor(private readonly authService: AuthService) {
    super('AuthController')
  }

  @Post('/signup')
  signUp(@Body(ValidationPipe) registrationInfo: RegistrationDto) {
    const { password, ...sanitizedInfo } = registrationInfo

    this.logger.log(`user sign up: ${JSON.stringify(sanitizedInfo)}`)

    return this.authService.signUp(registrationInfo);
  }

  @Post('/batch-signup')
  @UseGuards(AuthGuard())
  batchSignUp(@Body(ValidationPipe) registrationInfos: RegistrationDto[]) {
    return this.authService.batchSignUp(registrationInfos);
  }

  @Post('/signin')
  async signIn(@Body() authCredentials: AuthCredentialsDto) {
    this.logger.log(`user sign in: ${authCredentials.email}`)

    return await this.authService.signInWithPassword(authCredentials);
  }

  @Post('/reset-password')
  @UseGuards(AuthGuard())
  resetPassword(@Body(ValidationPipe) resetCredentials: ResetPasswordDto) {
    this.logger.log(`user password reset: ${resetCredentials.email}`)

    // return this.authService.resetPassword(resetCredentials);
  }

  @Post('/delete/:id')
  @UseGuards(AuthGuard())
  deleteUser(@Param('id') id: string) {
    this.logger.warn(`delete user: ${id}`)
 
    return this.authService.deleteUser(id);
  }
}
