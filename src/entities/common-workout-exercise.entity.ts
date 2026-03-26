import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonWorkout } from './common-workout.entity';
import { Exercise } from './exercise.entity';
import { CommonWorkoutParticipantSet } from './common-workout-participant-set.entity';

@Entity()
export class CommonWorkoutExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commonWorkoutId: number;

  @ManyToOne(() => CommonWorkout, (commonWorkout) => commonWorkout.exercises, {
    onDelete: 'CASCADE',
  })
  commonWorkout: CommonWorkout;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { eager: true, onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => CommonWorkoutParticipantSet, (set) => set.commonWorkoutExercise, {
    cascade: true,
    eager: true,
  })
  participantSets: CommonWorkoutParticipantSet[];
}
