import { BadRequestException, UnauthorizedException, ForbiddenException, NotFoundException, InternalServerErrorException } from "@nestjs/common";
import { AuthError } from "@supabase/supabase-js";

export function handleError(error: AuthError | any) {
  switch (error.status) {
    case 400:
      throw new BadRequestException(error.message);
    case 401:
      throw new UnauthorizedException(error.message);
    case 403:
      throw new ForbiddenException(error.message);
    case 404:
      throw new NotFoundException(error.message);
    case 500:
      throw new InternalServerErrorException(error.message);
    default:
      // Log the error for further investigation
      this.logger.error('Unhandled error:', error);
      throw new InternalServerErrorException('An unexpected error occurred.');
  }
}

