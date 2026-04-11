import { User } from './user.entity';
import { WorkoutTemplate } from './workout-template.entity';
export declare class WorkoutTemplateMember {
    id: number;
    templateId: number;
    template: WorkoutTemplate;
    userId: number;
    user: User;
}
