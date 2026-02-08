import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { ReportType } from "../enums/ReportType";

@Entity('analytics_reports')
export class AnalyticsReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'report_type', type: 'enum', enum: ReportType })
  reportType!: ReportType;

  @Column({ type: 'longtext' })
  data!: string; // JSON string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
