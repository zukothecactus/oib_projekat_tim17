import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255 })
  location!: string;

  @Column({ name: 'max_capacity', type: 'int' })
  maxCapacity!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
