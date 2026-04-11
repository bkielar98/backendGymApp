import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkoutTemplateExercise } from './workout-template-exercise.entity';
import { WorkoutTemplateMember } from './workout-template-member.entity';

@Entity()
export class WorkoutTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column('simple-array', { default: '' })
  labels: string[];

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date | null;

  @Column('simple-json', { nullable: true })
  tasks: string[] | null;

  @Column({ default: false })
  isShared: boolean;

  @Column({ unique: true, nullable: true })
  shareCode: string | null;

  @Column()
  userId: number;

  @ManyToOne(() => User, (user) => user.workoutTemplates, {
    onDelete: 'CASCADE',
    eager: true,
  })
  user: User;

  @OneToMany(() => WorkoutTemplateExercise, (exercise) => exercise.template, {
    cascade: true,
    eager: true,
  })
  exercises: WorkoutTemplateExercise[];

  @OneToMany(() => WorkoutTemplateMember, (member) => member.template, {
    cascade: true,
    eager: true,
  })
  members: WorkoutTemplateMember[];
}
