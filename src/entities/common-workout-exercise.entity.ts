import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutParticipant } from './common-workout-participant.entity';
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

  @Column({ nullable: true })
  participantId: number | null;

  @ManyToOne(() => CommonWorkoutParticipant, (participant) => participant.exercises, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  participant: CommonWorkoutParticipant | null;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => CommonWorkoutParticipantSet, (set) => set.commonWorkoutExercise, {
    cascade: true,
  })
  participantSets: CommonWorkoutParticipantSet[];
}
