import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export interface RecordedSaleItem {
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  unitPrice: number;
}

@Entity('recorded_sales')
export class RecordedSale {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'invoice_id' })
  invoiceId!: string;

  @Column({ name: 'sale_type' })
  saleType!: string;

  @Column({ name: 'payment_method' })
  paymentMethod!: string;

  @Column({ type: 'simple-json' })
  items!: RecordedSaleItem[];

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @Column({ name: 'sale_date', type: 'datetime' })
  saleDate!: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
