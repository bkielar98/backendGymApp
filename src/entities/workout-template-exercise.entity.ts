import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { WorkoutTemplate } from './workout-template.entity';
import { Exercise } from './exercise.entity';

@Entity()
export class WorkoutTemplateExercise {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: number;

  @ManyToOne(() => WorkoutTemplate, (template) => template.exercises, {
    onDelete: 'CASCADE',
  })
  template: WorkoutTemplate;

  @Column()
  exerciseId: number;

  @ManyToOne(() => Exercise, { eager: true, onDelete: 'CASCADE' })
  exercise: Exercise;

  @Column({ default: 0 })
  order: number;

  @Column({ default: 1 })
  setsCount: number;
}