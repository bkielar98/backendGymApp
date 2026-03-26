import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { CommonWorkout } from './common-workout.entity';
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

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => CommonWorkoutParticipantSet, (set) => set.participant, {
    cascade: true,
    eager: true,
  })
  sets: CommonWorkoutParticipantSet[];
}
