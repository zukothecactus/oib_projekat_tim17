import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { PlantStatus } from '../enums/PlantStatus';

@Entity('plants')
export class Plant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'common_name' })
  commonName!: string;

  @Column('decimal', { precision: 3, scale: 2, name: 'aromatic_strength' })
  aromaticStrength!: number;

  @Column({ name: 'latin_name' })
  latinName!: string;

  @Column({ name: 'origin_country' })
  originCountry!: string;

  @Column({ type: 'enum', enum: PlantStatus })
  status!: PlantStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
