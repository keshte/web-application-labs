export class OrderEntity {
  orderId!: string;
  productTitle!: string;
  productSlug!: string;
  unitPrice!: number;
  quantity!: number;
  subtotal!: number;
  taxAmount!: number;
  total!: number;
  currency!: string;
  status!: string;
  createdAt!: Date;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}
