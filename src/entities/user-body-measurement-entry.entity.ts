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

  @Column('float', { nullable: true })
  neck: number | null;

  @Column('float', { nullable: true })
  shoulders: number | null;

  @Column('float', { nullable: true })
  chest: number | null;

  @Column('float', { nullable: true })
  leftBiceps: number | null;

  @Column('float', { nullable: true })
  rightBiceps: number | null;

  @Column('float', { nullable: true })
  leftForearm: number | null;

  @Column('float', { nullable: true })
  rightForearm: number | null;

  @Column('float', { nullable: true })
  upperAbs: number | null;

  @Column('float', { nullable: true })
  waist: number | null;

  @Column('float', { nullable: true })
  lowerAbs: number | null;

  @Column('float', { nullable: true })
  hips: number | null;

  @Column('float', { nullable: true })
  leftThigh: number | null;

  @Column('float', { nullable: true })
  rightThigh: number | null;

  @Column('float', { nullable: true })
  leftCalf: number | null;

  @Column('float', { nullable: true })
  rightCalf: number | null;

  @ManyToOne(() => User, (user) => user.bodyMeasurementEntries, {
    onDelete: 'CASCADE',
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
