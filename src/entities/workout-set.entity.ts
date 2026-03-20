import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutExercise } from './workout-exercise.entity';

@Entity()
export class WorkoutSet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workoutExerciseId: number;

  @ManyToOne(() => WorkoutExercise, (workoutExercise) => workoutExercise.sets, {
    onDelete: 'CASCADE',
  })
  workoutExercise: WorkoutExercise;

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