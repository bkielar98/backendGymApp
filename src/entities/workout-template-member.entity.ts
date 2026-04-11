import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';
import { WorkoutTemplate } from './workout-template.entity';

@Entity()
export class WorkoutTemplateMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  templateId: number;

  @ManyToOne(() => WorkoutTemplate, (template) => template.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'templateId' })
  template: WorkoutTemplate;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;
}
