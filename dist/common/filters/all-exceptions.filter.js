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
        let message = 'Wystapil nieoczekiwany blad serwera.';
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
    getDefaultMessageForStatus(statusCode) {
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
    translateMessage(message) {
        const dictionary = {
            'Invalid credentials': 'Nieprawidlowy email lub haslo.',
            'User with this email already exists': 'Uzytkownik z takim adresem e-mail juz istnieje.',
            'User already exists': 'Uzytkownik juz istnieje.',
            'Workout not found': 'Nie znaleziono treningu.',
            'Active workout not found': 'Nie znaleziono aktywnego treningu.',
            'Workout exercise not found': 'Nie znaleziono cwiczenia w treningu.',
            'Workout set not found': 'Nie znaleziono serii treningowej.',
            'Workout template not found': 'Nie znaleziono planu treningowego.',
            'Exercise not found': 'Nie znaleziono cwiczenia.',
            'User not found': 'Nie znaleziono uzytkownika.',
            'You cannot send a friend request to yourself': 'Nie mozna wyslac zaproszenia do samego siebie.',
            'Friend request already exists': 'Zaproszenie do znajomych juz istnieje.',
            'Users are already friends': 'Uzytkownicy sa juz znajomymi.',
            'Friend request not found': 'Nie znaleziono zaproszenia do znajomych.',
            'Friendship not found': 'Nie znaleziono znajomosci.',
            'Common workout not found': 'Nie znaleziono wspolnego treningu.',
            'Active common workout not found': 'Nie znaleziono aktywnego wspolnego treningu.',
            'Common workout exercise not found': 'Nie znaleziono cwiczenia we wspolnym treningu.',
            'Common workout set not found': 'Nie znaleziono serii we wspolnym treningu.',
            'One of the participants already has an active workout': 'Jeden z uczestnikow ma juz aktywny trening.',
            'One of the participants already has an active common workout': 'Jeden z uczestnikow ma juz aktywny wspolny trening.',
            'User already has an active workout': 'Masz juz aktywny trening.',
            'Invalid or expired token': 'Nieprawidlowy lub wygasly token.',
            'Token expired': 'Token wygasl.',
            'Could not send confirmation email': 'Nie udalo sie wyslac wiadomosci potwierdzajacej.',
            Unauthorized: 'Brak autoryzacji.',
            Forbidden: 'Brak dostepu.',
            'Bad Request': 'Nieprawidlowe zadanie.',
            'Not Found': 'Nie znaleziono zasobu.',
            Conflict: 'Wystapil konflikt danych.',
        };
        return dictionary[message] || message;
    }
    translateValidationMessage(message) {
        const translations = [
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
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)()
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map