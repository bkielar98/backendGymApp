"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const exercises_module_1 = require("./exercises/exercises.module");
const workout_templates_module_1 = require("./workout-templates/workout-templates.module");
const gyms_module_1 = require("./gyms/gyms.module");
const muscle_status_module_1 = require("./muscle-status/muscle-status.module");
const workouts_module_1 = require("./workouts/workouts.module");
const gym_module_1 = require("./gym/gym.module");
const schema_fix_service_1 = require("./database/schema-fix.service");
const friends_module_1 = require("./friends/friends.module");
const common_workouts_module_1 = require("./common-workouts/common-workouts.module");
const loop_protection_interceptor_1 = require("./common/interceptors/loop-protection.interceptor");
const admin_module_1 = require("./admin/admin.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                username: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                synchronize: true,
                autoLoadEntities: true,
                extra: {
                    max: Number(process.env.DB_POOL_MAX ?? 1),
                },
                ssl: {
                    rejectUnauthorized: false,
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            exercises_module_1.ExercisesModule,
            workout_templates_module_1.WorkoutTemplatesModule,
            gyms_module_1.GymsModule,
            muscle_status_module_1.MuscleStatusModule,
            workouts_module_1.WorkoutsModule,
            gym_module_1.GymModule,
            friends_module_1.FriendsModule,
            common_workouts_module_1.CommonWorkoutsModule,
            admin_module_1.AdminModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            schema_fix_service_1.SchemaFixService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: loop_protection_interceptor_1.LoopProtectionInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map