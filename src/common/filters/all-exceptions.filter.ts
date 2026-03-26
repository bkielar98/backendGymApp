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
    let message = 'Wystapil nieoczekiwany blad serwera.';
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
      message = 'Wewnetrzny blad serwera.';
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
        return 'Nieprawidlowe dane.';
      case 401:
        return 'Brak autoryzacji.';
      case 403:
        return 'Brak dostepu do tego zasobu.';
      case 404:
        return 'Nie znaleziono zasobu.';
      case 409:
        return 'Konflikt danych.';
      case 422:
        return 'Dane zawieraja bledy.';
      default:
        return 'Wystapil blad.';
    }
  }

  private translateMessage(message: string): string {
    const dictionary: Record<string, string> = {
      'Invalid credentials': 'Nieprawidlowy email lub haslo.',
      'User with this email already exists':
        'Uzytkownik z takim adresem e-mail juz istnieje.',
      'User already exists': 'Uzytkownik juz istnieje.',
      'Workout not found': 'Nie znaleziono treningu.',
      'Active workout not found': 'Nie znaleziono aktywnego treningu.',
      'Workout exercise not found': 'Nie znaleziono cwiczenia w treningu.',
      'Workout set not found': 'Nie znaleziono serii treningowej.',
      'Workout template not found': 'Nie znaleziono planu treningowego.',
      'Exercise not found': 'Nie znaleziono cwiczenia.',
      'User not found': 'Nie znaleziono uzytkownika.',
      'You cannot send a friend request to yourself':
        'Nie mozna wyslac zaproszenia do samego siebie.',
      'Friend request already exists': 'Zaproszenie do znajomych juz istnieje.',
      'Users are already friends': 'Uzytkownicy sa juz znajomymi.',
      'Friend request not found': 'Nie znaleziono zaproszenia do znajomych.',
      'Friendship not found': 'Nie znaleziono znajomosci.',
      'User already has an active workout': 'Masz juz aktywny trening.',
      'Invalid or expired token': 'Nieprawidlowy lub wygasly token.',
      'Token expired': 'Token wygasl.',
      'Could not send confirmation email':
        'Nie udalo sie wyslac wiadomosci potwierdzajacej.',
      Unauthorized: 'Brak autoryzacji.',
      Forbidden: 'Brak dostepu.',
      'Bad Request': 'Nieprawidlowe zadanie.',
      'Not Found': 'Nie znaleziono zasobu.',
      Conflict: 'Wystapil konflikt danych.',
    };

    return dictionary[message] || message;
  }

  private translateValidationMessage(message: string): string {
    const translations: Array<[RegExp, string]> = [
      [/must be an email/i, 'musi byc poprawnym adresem e-mail'],
      [/must be a string/i, 'musi byc tekstem'],
      [
        /must be a number conforming to the specified constraints/i,
        'musi byc poprawna liczba',
      ],
      [/must be an integer number/i, 'musi byc liczba calkowita'],
      [/must not be less than (\d+)/i, 'musi byc wieksze lub rowne $1'],
      [
        /must be longer than or equal to (\d+) characters/i,
        'musi miec co najmniej $1 znakow',
      ],
      [/should not be empty/i, 'pole jest wymagane'],
      [/must be an array/i, 'musi byc tablica'],
      [
        /each value in nested property .* must be either object or array/i,
        'zawiera nieprawidlowa strukture danych',
      ],
      [/property (.+) should not exist/i, 'pole $1 nie powinno zostac przeslane'],
    ];

    let translated = message;

    for (const [pattern, replacement] of translations) {
      translated = translated.replace(pattern, replacement);
    }

    return translated;
  }
}
