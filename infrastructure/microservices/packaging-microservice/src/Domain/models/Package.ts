import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { PackageStatus } from '../enums/PackageStatus';

@Entity('packages')
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'sender_address', type: 'varchar', length: 255 })
  senderAddress!: string;

  @Column({ name: 'warehouse_id', type: 'varchar', length: 36, nullable: true })
  warehouseId!: string | null;

  @Column({ name: 'perfume_ids', type: 'simple-json' })
  perfumeIds!: string[];

  @Column({ type: 'enum', enum: PackageStatus })
  status!: PackageStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
