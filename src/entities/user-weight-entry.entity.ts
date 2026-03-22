import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserWeightEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  recordedOn: string;

  @Column('float')
  weight: number;

  @ManyToOne(() => User, (user) => user.weightEntries, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
