import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';

@Entity()
export class WorkoutTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.workoutTemplates, { onDelete: 'CASCADE' })
  user: User;

  @OneToMany(() => WorkoutTemplateExercise, (exercise) => exercise.template, {
    cascade: true,
    eager: true,
  })
  exercises: WorkoutTemplateExercise[];
}