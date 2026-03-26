import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CommonWorkoutParticipant } from './common-workout-participant.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';

@Entity()
export class CommonWorkoutParticipantSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  participantId: number;

  @ManyToOne(() => CommonWorkoutParticipant, (participant) => participant.sets, {
    onDelete: 'CASCADE',
  })
  participant: CommonWorkoutParticipant;

  @Column()
  commonWorkoutExerciseId: number;

  @ManyToOne(
    () => CommonWorkoutExercise,
    (commonWorkoutExercise) => commonWorkoutExercise.participantSets,
    {
      onDelete: 'CASCADE',
    },
  )
  commonWorkoutExercise: CommonWorkoutExercise;

  @Column()
  setNumber: number;

  @Column('float', { nullable: true })
  previousWeight: number | null;

  @Column({ nullable: true })
  previousReps: number | null;

  @Column('float', { nullable: true })
  currentWeight: number | null;

  @Column({ nullable: true })
  currentReps: number | null;

  @Column('float', { nullable: true })
  repMax: number | null;

  @Column({ default: false })
  confirmed: boolean;
}
