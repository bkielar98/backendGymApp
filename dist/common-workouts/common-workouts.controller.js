"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWorkoutsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const common_workouts_service_1 = require("./common-workouts.service");
const start_common_workout_dto_1 = require("./dto/start-common-workout.dto");
const update_common_workout_dto_1 = require("./dto/update-common-workout.dto");
const add_common_workout_exercise_dto_1 = require("./dto/add-common-workout-exercise.dto");
const change_common_workout_exercise_position_dto_1 = require("./dto/change-common-workout-exercise-position.dto");
const change_common_workout_exercise_dto_1 = require("./dto/change-common-workout-exercise.dto");
const update_common_workout_set_dto_1 = require("./dto/update-common-workout-set.dto");
const confirm_common_workout_set_dto_1 = require("./dto/confirm-common-workout-set.dto");
const get_workout_dashboard_stats_dto_1 = require("./dto/get-workout-dashboard-stats.dto");
let CommonWorkoutsController = class CommonWorkoutsController {
    constructor(commonWorkoutsService) {
        this.commonWorkoutsService = commonWorkoutsService;
    }
    async start(req, dto) {
        return this.commonWorkoutsService.start(req.user.id, dto);
    }
    async getActive(req) {
        return this.commonWorkoutsService.getActive(req.user.id);
    }
    async getDashboardStats(req, dto) {
        return this.commonWorkoutsService.getDashboardStatsForUser(req.user.id, dto);
    }
    async getExerciseHistory(req, exerciseId) {
        return this.commonWorkoutsService.getExerciseHistoryForUser(req.user.id, exerciseId);
    }
    async findSummary(req, id) {
        return this.commonWorkoutsService.getSummaryForUser(req.user.id, id);
    }
    async findExercise(req, id, exerciseId) {
        return this.commonWorkoutsService.getExerciseByIdForUser(req.user.id, id, exerciseId);
    }
    async findOne(req, id) {
        return this.commonWorkoutsService.getByIdForUser(req.user.id, id);
    }
    async update(req, id, dto) {
        return this.commonWorkoutsService.updateCommonWorkout(req.user.id, id, dto);
    }
    async addExercise(req, id, dto) {
        return this.commonWorkoutsService.addExercise(req.user.id, id, dto);
    }
    async changeExercisePosition(req, id, exerciseId, dto) {
        return this.commonWorkoutsService.changeExercisePosition(req.user.id, id, exerciseId, dto);
    }
    async changeExercise(req, id, exerciseId, dto) {
        return this.commonWorkoutsService.changeExercise(req.user.id, id, exerciseId, dto);
    }
    async removeExercise(req, id, exerciseId) {
        return this.commonWorkoutsService.removeExercise(req.user.id, id, exerciseId);
    }
    async addSet(req, exerciseId) {
        return this.commonWorkoutsService.addSet(req.user.id, exerciseId);
    }
    async removeSet(req, setId) {
        return this.commonWorkoutsService.removeSet(req.user.id, setId);
    }
    async updateSet(req, setId, dto) {
        return this.commonWorkoutsService.updateSet(req.user.id, setId, dto);
    }
    async confirmSet(req, setId, dto) {
        return this.commonWorkoutsService.confirmSet(req.user.id, setId, dto);
    }
    async finish(req, id) {
        return this.commonWorkoutsService.finish(req.user.id, id);
    }
};
exports.CommonWorkoutsController = CommonWorkoutsController;
__decorate([
    (0, common_1.Post)('start'),
    (0, swagger_1.ApiOperation)({
        summary: 'Start workout',
        description: 'Uruchamia workout w trybie solo albo grupowym. Gdy `participantUserIds` jest puste, powstaje workout solo.',
    }),
    (0, swagger_1.ApiBody)({ type: start_common_workout_dto_1.StartCommonWorkoutDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, start_common_workout_dto_1.StartCommonWorkoutDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "start", null);
__decorate([
    (0, common_1.Get)('active'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get active workout',
        description: 'Zwraca aktualnie aktywny workout usera albo `null`.',
    }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workout dashboard stats',
        description: 'Zwraca statystyki dashboardu dla wskazanego zakresu dat: ulubione cwiczenie, rekord, ulubiony dzien, liczbe treningow i ulubionego partnera.',
    }),
    (0, swagger_1.ApiQuery)({ name: 'dateFrom', type: String, required: true, example: '2026-04-01' }),
    (0, swagger_1.ApiQuery)({ name: 'dateTo', type: String, required: true, example: '2026-04-30' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, get_workout_dashboard_stats_dto_1.GetWorkoutDashboardStatsDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('exercises/:exerciseId/history'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get exercise history',
        description: 'Zwraca historie serii usera dla konkretnego cwiczenia wraz z data i nazwa workoutu.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia, dla ktorego ma zostac zwrocona historia.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "getExerciseHistory", null);
__decorate([
    (0, common_1.Get)(':id/summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workout summary',
        description: 'Zwraca lekki summary workoutu. Dziala dla aktywnego workoutu i dla historycznego wpisu.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID workoutu albo wpisu historycznego.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "findSummary", null);
__decorate([
    (0, common_1.Get)(':id/exercises/:exerciseId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workout exercise details',
        description: 'Zwraca szczegoly pojedynczego cwiczenia wraz z seriami wszystkich uczestnikow w danym workout.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia wewnatrz workoutu.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "findExercise", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get workout',
        description: 'Zwraca aktywny workout z uczestnikami, cwiczeniami i seriami. Payload dziala dla solo i grupy.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update workout',
        description: 'Aktualizuje metadane workoutu, np. nazwe.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiBody)({ type: update_common_workout_dto_1.UpdateCommonWorkoutDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_common_workout_dto_1.UpdateCommonWorkoutDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/exercises'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add exercise to workout',
        description: 'Dodaje nowe cwiczenie do aktywnego workoutu.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiBody)({ type: add_common_workout_exercise_dto_1.AddCommonWorkoutExerciseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, add_common_workout_exercise_dto_1.AddCommonWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "addExercise", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseId/position'),
    (0, swagger_1.ApiOperation)({
        summary: 'Change workout exercise position',
        description: 'Zmienia kolejnosc cwiczenia w aktywnym workoucie.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia wewnatrz workoutu.',
    }),
    (0, swagger_1.ApiBody)({ type: change_common_workout_exercise_position_dto_1.ChangeCommonWorkoutExercisePositionDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_common_workout_exercise_position_dto_1.ChangeCommonWorkoutExercisePositionDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "changeExercisePosition", null);
__decorate([
    (0, common_1.Patch)(':id/exercises/:exerciseId/exercise'),
    (0, swagger_1.ApiOperation)({
        summary: 'Replace workout exercise',
        description: 'Podmienia cwiczenie na inne, zachowujac miejsce w workoucie.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia wewnatrz workoutu.',
    }),
    (0, swagger_1.ApiBody)({ type: change_common_workout_exercise_dto_1.ChangeCommonWorkoutExerciseDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, change_common_workout_exercise_dto_1.ChangeCommonWorkoutExerciseDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "changeExercise", null);
__decorate([
    (0, common_1.Delete)(':id/exercises/:exerciseId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove workout exercise',
        description: 'Usuwa cwiczenie z aktywnego workoutu.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia wewnatrz workoutu.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "removeExercise", null);
__decorate([
    (0, common_1.Post)('exercises/:exerciseId/add-set'),
    (0, swagger_1.ApiOperation)({
        summary: 'Add set to workout exercise',
        description: 'Dodaje kolejna serie do cwiczenia w aktywnym workoucie.',
    }),
    (0, swagger_1.ApiParam)({
        name: 'exerciseId',
        type: Number,
        description: 'ID cwiczenia wewnatrz workoutu.',
    }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('exerciseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "addSet", null);
__decorate([
    (0, common_1.Delete)('sets/:setId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Remove workout set',
        description: 'Usuwa serie z workoutu i przelicza numeracje pozostalych serii.',
    }),
    (0, swagger_1.ApiParam)({ name: 'setId', type: Number, description: 'ID serii w workoucie.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "removeSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId'),
    (0, swagger_1.ApiOperation)({
        summary: 'Update workout set draft',
        description: 'Aktualizuje robocze dane serii, np. wage lub liczbe powtorzen.',
    }),
    (0, swagger_1.ApiParam)({ name: 'setId', type: Number, description: 'ID serii w workoucie.' }),
    (0, swagger_1.ApiBody)({ type: update_common_workout_set_dto_1.UpdateCommonWorkoutSetDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, update_common_workout_set_dto_1.UpdateCommonWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "updateSet", null);
__decorate([
    (0, common_1.Patch)('sets/:setId/confirm'),
    (0, swagger_1.ApiOperation)({
        summary: 'Confirm workout set',
        description: 'Potwierdza wykonanie serii i zapisuje finalne dane serii.',
    }),
    (0, swagger_1.ApiParam)({ name: 'setId', type: Number, description: 'ID serii w workoucie.' }),
    (0, swagger_1.ApiBody)({ type: confirm_common_workout_set_dto_1.ConfirmCommonWorkoutSetDto }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('setId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, confirm_common_workout_set_dto_1.ConfirmCommonWorkoutSetDto]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "confirmSet", null);
__decorate([
    (0, common_1.Post)(':id/finish'),
    (0, swagger_1.ApiOperation)({
        summary: 'Finish workout',
        description: 'Konczy workout i zapisuje wynik do historii indywidualnych treningow wszystkich uczestnikow.',
    }),
    (0, swagger_1.ApiParam)({ name: 'id', type: Number, description: 'ID aktywnego workoutu.' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CommonWorkoutsController.prototype, "finish", null);
exports.CommonWorkoutsController = CommonWorkoutsController = __decorate([
    (0, swagger_1.ApiTags)('workouts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('workouts'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [common_workouts_service_1.CommonWorkoutsService])
], CommonWorkoutsController);
//# sourceMappingURL=common-workouts.controller.js.map