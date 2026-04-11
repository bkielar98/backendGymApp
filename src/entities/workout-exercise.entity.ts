import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Workout } from './workout.entity';
import { Exercise } from './exercise.entity';
import { WorkoutSet } from './workout-set.entity';

@Entity()
export class WorkoutExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  workoutId: number;

  @ManyToOne(() => Workout, (workout) => workout.exercises, {
    onDelete: 'CASCADE',
  })
  workout: Workout;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ default: 0 })
  order: number;

  @OneToMany(() => WorkoutSet, (set) => set.workoutExercise, {
    cascade: true,
  })
  sets: WorkoutSet[];
}
