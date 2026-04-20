import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';
import { Exercise } from './exercise.entity';
import { User } from './user.entity';
import { Workout } from './workout.entity';

@Entity()
@Index(['userId', 'exerciseId'], { unique: true })
export class UserExercisePersonalBest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ nullable: true })
  workoutId: number | null;

  @ManyToOne(() => Workout, { nullable: true, onDelete: 'SET NULL' })
  workout: Workout | null;

  @Column('float')
  weight: number;

  @Column()
  reps: number;

  @Column('float')
  repMax: number;

  @Column({ type: 'timestamp' })
  achievedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
