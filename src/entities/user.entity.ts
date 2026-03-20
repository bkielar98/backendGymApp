import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { WorkoutTemplate } from './workout-template.entity';
import { MuscleStatus } from './muscle-status.entity';
import { Workout } from './workout.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column('float', { nullable: true })
  weight: number;

  @Column({ nullable: true })
  gender: string;

  @OneToMany(() => WorkoutTemplate, (template) => template.user)
  workoutTemplates: WorkoutTemplate[];

  @OneToMany(() => MuscleStatus, (status) => status.user)
  muscleStatuses: MuscleStatus[];

  @OneToMany(() => Workout, (workout) => workout.user)
  workouts: Workout[];
}