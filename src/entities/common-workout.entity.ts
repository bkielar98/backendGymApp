import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { WorkoutTemplate } from './workout-template.entity';
import { CommonWorkoutParticipant } from './common-workout-participant.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';

export enum CommonWorkoutStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class CommonWorkout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdByUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  createdByUser: User;

  @Column({ nullable: true })
  templateId: number | null;

  @ManyToOne(() => WorkoutTemplate, { nullable: true, onDelete: 'SET NULL' })
  template: WorkoutTemplate | null;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CommonWorkoutStatus,
    default: CommonWorkoutStatus.ACTIVE,
  })
  status: CommonWorkoutStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @OneToMany(() => CommonWorkoutParticipant, (participant) => participant.commonWorkout, {
    cascade: true,
  })
  participants: CommonWorkoutParticipant[];

  @OneToMany(() => CommonWorkoutExercise, (exercise) => exercise.commonWorkout, {
    cascade: true,
  })
  exercises: CommonWorkoutExercise[];
}
