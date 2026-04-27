import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: unknown = undefined;
    let stack: string | undefined = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as Record<string, unknown>;
        message = (resp.message as string) || message;
        errors = resp.errors;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      stack = exception.stack;
      this.logger.error(`Unhandled Error: ${exception.message}`, stack);
    }

    if (status >= 500) {
      this.logger.error(`Server Error ${status}: ${message}`, stack);
    } else if (status >= 400) {
      this.logger.warn(`Client Error ${status}: ${message}`);
    }

    response.status(status).json({
      code: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
