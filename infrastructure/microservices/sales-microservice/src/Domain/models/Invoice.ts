import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";
import { SaleType } from "../enums/SaleType";
import { PaymentMethod } from "../enums/PaymentMethod";

export interface InvoiceItem {
  perfumeId: string;
  perfumeName: string;
  quantity: number;
  unitPrice: number;
}

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sale_type', type: 'enum', enum: SaleType })
  saleType!: SaleType;

  @Column({ name: 'payment_method', type: 'enum', enum: PaymentMethod })
  paymentMethod!: PaymentMethod;

  @Column({ type: 'simple-json' })
  items!: InvoiceItem[];

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
