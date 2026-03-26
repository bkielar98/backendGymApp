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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonWorkoutParticipantSet = void 0;
const typeorm_1 = require("typeorm");
const common_workout_participant_entity_1 = require("./common-workout-participant.entity");
const common_workout_exercise_entity_1 = require("./common-workout-exercise.entity");
let CommonWorkoutParticipantSet = class CommonWorkoutParticipantSet {
};
exports.CommonWorkoutParticipantSet = CommonWorkoutParticipantSet;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "participantId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => common_workout_participant_entity_1.CommonWorkoutParticipant, (participant) => participant.sets, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", common_workout_participant_entity_1.CommonWorkoutParticipant)
], CommonWorkoutParticipantSet.prototype, "participant", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "commonWorkoutExerciseId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => common_workout_exercise_entity_1.CommonWorkoutExercise, (commonWorkoutExercise) => commonWorkoutExercise.participantSets, {
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", common_workout_exercise_entity_1.CommonWorkoutExercise)
], CommonWorkoutParticipantSet.prototype, "commonWorkoutExercise", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "setNumber", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "previousWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "previousReps", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "currentWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "currentReps", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], CommonWorkoutParticipantSet.prototype, "repMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], CommonWorkoutParticipantSet.prototype, "confirmed", void 0);
exports.CommonWorkoutParticipantSet = CommonWorkoutParticipantSet = __decorate([
    (0, typeorm_1.Entity)()
], CommonWorkoutParticipantSet);
//# sourceMappingURL=common-workout-participant-set.entity.js.map