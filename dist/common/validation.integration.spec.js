"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const common_1 = require("@nestjs/common");
const confirm_common_workout_set_dto_1 = require("../common-workouts/dto/confirm-common-workout-set.dto");
const start_common_workout_dto_1 = require("../common-workouts/dto/start-common-workout.dto");
const update_common_workout_set_dto_1 = require("../common-workouts/dto/update-common-workout-set.dto");
const create_exercise_dto_1 = require("../exercises/dto/create-exercise.dto");
const create_body_measurement_entry_dto_1 = require("../users/dto/create-body-measurement-entry.dto");
const create_weight_entry_dto_1 = require("../users/dto/create-weight-entry.dto");
(0, globals_1.describe)('Validation integration', () => {
    const pipe = new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
    });
    (0, globals_1.it)('rejects absurd body weight values', async () => {
        await (0, globals_1.expect)(pipe.transform({
            recordedOn: '2026-04-20',
            weight: 98321741982749878,
        }, {
            type: 'body',
            metatype: create_weight_entry_dto_1.CreateWeightEntryDto,
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    (0, globals_1.it)('rejects absurd workout set weight values', async () => {
        await (0, globals_1.expect)(pipe.transform({
            currentWeight: 98321741982749878,
        }, {
            type: 'body',
            metatype: update_common_workout_set_dto_1.UpdateCommonWorkoutSetDto,
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    (0, globals_1.it)('rejects absurd confirmed workout set values', async () => {
        await (0, globals_1.expect)(pipe.transform({
            currentWeight: 98321741982749878,
            currentReps: 8,
        }, {
            type: 'body',
            metatype: confirm_common_workout_set_dto_1.ConfirmCommonWorkoutSetDto,
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    (0, globals_1.it)('accepts nullable body measurements', async () => {
        await (0, globals_1.expect)(pipe.transform({
            recordedOn: '2026-04-20',
            neck: null,
            shoulders: 120,
            chest: null,
            waist: 83,
        }, {
            type: 'body',
            metatype: create_body_measurement_entry_dto_1.CreateBodyMeasurementEntryDto,
        })).resolves.toEqual({
            recordedOn: '2026-04-20',
            neck: null,
            shoulders: 120,
            chest: null,
            waist: 83,
        });
    });
    (0, globals_1.it)('rejects workout names made only of spaces', async () => {
        await (0, globals_1.expect)(pipe.transform({
            name: '     ',
        }, {
            type: 'body',
            metatype: start_common_workout_dto_1.StartCommonWorkoutDto,
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
    (0, globals_1.it)('rejects exercise names made only of spaces', async () => {
        await (0, globals_1.expect)(pipe.transform({
            name: '   ',
            muscleGroups: ['chest'],
        }, {
            type: 'body',
            metatype: create_exercise_dto_1.CreateExerciseDto,
        })).rejects.toBeInstanceOf(common_1.BadRequestException);
    });
});
//# sourceMappingURL=validation.integration.spec.js.map