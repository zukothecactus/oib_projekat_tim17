import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('performance_reports')
export class PerformanceReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'algorithm_name', type: 'varchar' })
  algorithmName!: string;

  @Column({ name: 'simulation_params', type: 'simple-json' })
  simulationParams!: any;

  @Column({ type: 'longtext' })
  results!: string; // JSON

  @Column({ type: 'text' })
  conclusion!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
