import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('stored_packages')
export class StoredPackage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'package_id' })
  packageId!: string;

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({ name: 'package_data', type: 'simple-json' })
  packageData!: any;

  @Column({ name: 'is_dispatched', default: false })
  isDispatched!: boolean;

  @CreateDateColumn({ name: 'received_at' })
  receivedAt!: Date;
}
