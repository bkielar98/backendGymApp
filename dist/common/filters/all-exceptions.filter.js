"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
let AllExceptionsFilter = class AllExceptionsFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let statusCode = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Wystąpił nieoczekiwany błąd serwera.';
        let details = [];
        if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = this.translateMessage(exceptionResponse);
            }
            else if (typeof exceptionResponse === 'object' &&
                exceptionResponse !== null) {
                const responseObject = exceptionResponse;
                if (Array.isArray(responseObject.message)) {
                    details = responseObject.message.map((item) => this.translateValidationMessage(item));
                    message = this.getDefaultMessageForStatus(statusCode);
                }
                else if (typeof responseObject.message === 'string') {
                    message = this.translateMessage(responseObject.message);
                }
                else if (typeof responseObject.error === 'string') {
                    message = this.translateMessage(responseObject.error);
                }
                else {
                    message = this.getDefaultMessageForStatus(statusCode);
                }
            }
        }
        else if (exception instanceof Error) {
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
    getDefaultMessageForStatus(statusCode) {
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
    translateMessage(message) {
        const dictionary = {
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
    translateValidationMessage(message) {
        const translations = [
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map