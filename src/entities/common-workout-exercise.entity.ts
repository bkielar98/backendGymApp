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
import { CommonWorkoutBlock } from './common-workout-block.entity';

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

  @ManyToOne(
    () => CommonWorkoutParticipant,
    (participant) => participant.exercises,
    {
      nullable: true,
      onDelete: 'CASCADE',
    },
  )
  participant: CommonWorkoutParticipant | null;

  @Column({ nullable: true })
  blockId: number | null;

  @ManyToOne(() => CommonWorkoutBlock, (block) => block.userExercises, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  block: CommonWorkoutBlock | null;

  @Column({ nullable: true })
  exerciseId: number | null;

  @ManyToOne(() => Exercise, { nullable: true, onDelete: 'SET NULL' })
  exercise: Exercise | null;

  @Column({ default: 0 })
  order: number;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @OneToMany(
    () => CommonWorkoutParticipantSet,
    (set) => set.commonWorkoutExercise,
    {
      cascade: true,
    },
  )
  participantSets: CommonWorkoutParticipantSet[];
}
