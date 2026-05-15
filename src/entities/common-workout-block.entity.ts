import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';
import { Exercise } from './exercise.entity';

export enum CommonWorkoutBlockStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class CommonWorkoutBlock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commonWorkoutId: number;

  @ManyToOne(() => CommonWorkout, (workout) => workout.blocks, {
    onDelete: 'CASCADE',
  })
  commonWorkout: CommonWorkout;

  @Column({ default: 0 })
  order: number;

  @Column({ nullable: true })
  defaultExerciseId: number | null;

  @ManyToOne(() => Exercise, { nullable: true, onDelete: 'SET NULL' })
  defaultExercise: Exercise | null;

  @Column({
    type: 'enum',
    enum: CommonWorkoutBlockStatus,
    default: CommonWorkoutBlockStatus.ACTIVE,
  })
  status: CommonWorkoutBlockStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(() => CommonWorkoutExercise, (exercise) => exercise.block, {
    cascade: true,
  })
  userExercises: CommonWorkoutExercise[];
}
