import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { PerfumeType } from '../enums/PerfumeType';
import { PerfumeStatus } from '../enums/PerfumeStatus';

@Entity('perfumes')
export class Perfume {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'enum', enum: PerfumeType })
  type!: PerfumeType;

  @Column('int')
  volume!: number;

  @Column({ name: 'serial_number' })
  serialNumber!: string;

  @Column({ name: 'expires_at' })
  expiresAt!: string;

  @Column({ type: 'enum', enum: PerfumeStatus })
  status!: PerfumeStatus;

  @Column({ name: 'plant_id', type: 'varchar', length: 36, nullable: true })
  plantId!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
