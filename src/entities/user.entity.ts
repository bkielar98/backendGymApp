import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
import { Workout } from './workout.entity';
import { UserWeightEntry } from './user-weight-entry.entity';
import { UserBodyMeasurementEntry } from './user-body-measurement-entry.entity';
import { WorkoutTemplateMember } from './workout-template-member.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  @Exclude()
  refreshTokenHash: string | null;

  @Column()
  name: string;

  @Column('float', { nullable: true })
  weight: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  avatarPath: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => WorkoutTemplate, (template) => template.user)
  workoutTemplates: WorkoutTemplate[];

  @OneToMany(() => WorkoutTemplateMember, (member) => member.user)
  sharedWorkoutTemplates: WorkoutTemplateMember[];

  @OneToMany(() => MuscleStatus, (status) => status.user)
  muscleStatuses: MuscleStatus[];

  @OneToMany(() => Workout, (workout) => workout.user)
  workouts: Workout[];

  @OneToMany(() => UserWeightEntry, (entry) => entry.user)
  weightEntries: UserWeightEntry[];

  @OneToMany(() => UserBodyMeasurementEntry, (entry) => entry.user)
  bodyMeasurementEntries: UserBodyMeasurementEntry[];
}
