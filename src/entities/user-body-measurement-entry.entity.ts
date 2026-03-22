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
export class UserBodyMeasurementEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  recordedOn: string;

  @Column('float')
  neck: number;

  @Column('float')
  shoulders: number;

  @Column('float')
  chest: number;

  @Column('float')
  leftBiceps: number;

  @Column('float')
  rightBiceps: number;

  @Column('float')
  leftForearm: number;

  @Column('float')
  rightForearm: number;

  @Column('float')
  upperAbs: number;

  @Column('float')
  waist: number;

  @Column('float')
  lowerAbs: number;

  @Column('float')
  hips: number;

  @Column('float')
  leftThigh: number;

  @Column('float')
  rightThigh: number;

  @Column('float')
  leftCalf: number;

  @Column('float')
  rightCalf: number;

  @ManyToOne(() => User, (user) => user.bodyMeasurementEntries, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
