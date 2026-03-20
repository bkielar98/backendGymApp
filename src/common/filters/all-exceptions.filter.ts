import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Wystąpił nieoczekiwany błąd serwera.';
    let details: string[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();

      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = this.translateMessage(exceptionResponse);
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const responseObject = exceptionResponse as {
          message?: string | string[];
          error?: string;
        };

        if (Array.isArray(responseObject.message)) {
          details = responseObject.message.map((item) =>
            this.translateValidationMessage(item),
          );
          message = this.getDefaultMessageForStatus(statusCode);
        } else if (typeof responseObject.message === 'string') {
          message = this.translateMessage(responseObject.message);
        } else if (typeof responseObject.error === 'string') {
          message = this.translateMessage(responseObject.error);
        } else {
          message = this.getDefaultMessageForStatus(statusCode);
        }
      }
    } else if (exception instanceof Error) {
      message = 'Wewnętrzny błąd serwera.';
      details = [exception.message];
    }

    response.status(statusCode).json({
      statusCode,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getDefaultMessageForStatus(statusCode: number): string {
    switch (statusCode) {
      case 400:
        return 'Nieprawidłowe dane.';
      case 401:
        return 'Brak autoryzacji.';
      case 403:
        return 'Brak dostępu do tego zasobu.';
      case 404:
        return 'Nie znaleziono zasobu.';
      case 409:
        return 'Konflikt danych.';
      case 422:
        return 'Dane zawierają błędy.';
      default:
        return 'Wystąpił błąd.';
    }
  }

  private translateMessage(message: string): string {
    const dictionary: Record<string, string> = {
      'Invalid credentials': 'Nieprawidłowy email lub hasło.',
      'User with this email already exists': 'Użytkownik z takim adresem e-mail już istnieje.',
      'User already exists': 'Użytkownik już istnieje.',
      'Workout not found': 'Nie znaleziono treningu.',
      'Active workout not found': 'Nie znaleziono aktywnego treningu.',
      'Workout exercise not found': 'Nie znaleziono ćwiczenia w treningu.',
      'Workout set not found': 'Nie znaleziono serii treningowej.',
      'Workout template not found': 'Nie znaleziono planu treningowego.',
      'Exercise not found': 'Nie znaleziono ćwiczenia.',
      'User already has an active workout': 'Masz już aktywny trening.',
      'Invalid or expired token': 'Nieprawidłowy lub wygasły token.',
      'Token expired': 'Token wygasł.',
      'Could not send confirmation email': 'Nie udało się wysłać wiadomości potwierdzającej.',
      Unauthorized: 'Brak autoryzacji.',
      Forbidden: 'Brak dostępu.',
      'Bad Request': 'Nieprawidłowe żądanie.',
      'Not Found': 'Nie znaleziono zasobu.',
      Conflict: 'Wystąpił konflikt danych.',
    };

    return dictionary[message] || message;
  }

  private translateValidationMessage(message: string): string {
    const translations: Array<[RegExp, string]> = [
      [/must be an email/i, 'musi być poprawnym adresem e-mail'],
      [/must be a string/i, 'musi być tekstem'],
      [/must be a number conforming to the specified constraints/i, 'musi być poprawną liczbą'],
      [/must be an integer number/i, 'musi być liczbą całkowitą'],
      [/must not be less than (\d+)/i, 'musi być większe lub równe $1'],
      [/must be longer than or equal to (\d+) characters/i, 'musi mieć co najmniej $1 znaków'],
      [/should not be empty/i, 'pole jest wymagane'],
      [/must be an array/i, 'musi być tablicą'],
      [/each value in nested property .* must be either object or array/i, 'zawiera nieprawidłową strukturę danych'],
      [/property (.+) should not exist/i, 'pole $1 nie powinno zostać przesłane'],
    ];

    let translated = message;

    for (const [pattern, replacement] of translations) {
      translated = translated.replace(pattern, replacement);
    }

    return translated;
  }
}