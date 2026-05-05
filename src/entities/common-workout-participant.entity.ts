import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CommonWorkout } from './common-workout.entity';
import { CommonWorkoutExercise } from './common-workout-exercise.entity';
import { CommonWorkoutParticipantSet } from './common-workout-participant-set.entity';

@Entity()
export class CommonWorkoutParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  commonWorkoutId: number;

  @ManyToOne(() => CommonWorkout, (commonWorkout) => commonWorkout.participants, {
    onDelete: 'CASCADE',
  })
  commonWorkout: CommonWorkout;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => CommonWorkoutExercise, (exercise) => exercise.participant, {
    cascade: true,
  })
  exercises: CommonWorkoutExercise[];

  @OneToMany(() => CommonWorkoutParticipantSet, (set) => set.participant, {
    cascade: true,
  })
  sets: CommonWorkoutParticipantSet[];
}
