import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class WorkoutTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.workoutTemplates)
  user: User;

  @ManyToMany(() => Exercise)
  @JoinTable()
  exercises: Exercise[];
}