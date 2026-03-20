import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkoutExercise } from './workout-exercise.entity';
import { WorkoutTemplate } from './workout-template.entity';

export enum WorkoutStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

@Entity()
export class Workout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.workouts, { onDelete: 'CASCADE' })
  user: User;

  @Column({ nullable: true })
  templateId: number | null;

  @ManyToOne(() => WorkoutTemplate, { nullable: true, onDelete: 'SET NULL' })
  template: WorkoutTemplate | null;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: WorkoutStatus,
    default: WorkoutStatus.ACTIVE,
  })
  status: WorkoutStatus;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  finishedAt: Date | null;

  @OneToMany(() => WorkoutExercise, (exercise) => exercise.workout, {
    cascade: true,
    eager: true,
  })
  exercises: WorkoutExercise[];
}