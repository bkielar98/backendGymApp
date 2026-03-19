import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class MuscleStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, user => user.muscleStatuses)
  user: User;

  @Column()
  muscleGroup: string;

  @Column({ type: 'timestamp', nullable: true })
  lastTrainedAt: Date;
}