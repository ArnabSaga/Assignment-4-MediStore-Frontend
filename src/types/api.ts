export type Role = "CUSTOMER" | "SELLER" | "ADMIN";

export type Money = number | string;

export type ApiMeta = {
  page?: number;
  limit?: number;
  total?: number;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  meta?: ApiMeta;
  data: T;
};

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string | null; 
  createdAt?: string;
  updatedAt?: string;
};

export type Medicine = {
  id: string;
  name: string;
  slug?: string;
  price: Money;
  stock: number;
  manufacturer: string;

  description?: string | null;
  imageUrl?: string | null;

  isActive?: boolean;

  categoryId: string;
  sellerId?: string;

  createdAt?: string;
  updatedAt?: string;

  category?: Category;
};

export type OrderStatus =
  | "PLACED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export type OrderItem = {
  id: string;
  orderId: string;
  medicineId: string;

  quantity: number;
  price: Money;

  createdAt?: string;
  updatedAt?: string;

  medicine?: Medicine;
};

export type Order = {
  id: string;
  customerId: string;
  sellerId: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  transactionId?: string | null;

  totalAmount: Money;
  shippingAddress: string;

  createdAt?: string;
  updatedAt?: string;

  items?: OrderItem[];
};

export type CurrentUser = {
  id: string;
  name: string;
  email: string;

  emailVerified: boolean;

  image?: string | null;
  phone?: string | null;

  role: Role;
  isBanned: boolean;

  createdAt?: string;
  updatedAt?: string;
};

export type CreateOrderItemDTO = {
  medicineId: string;
  quantity: number;
};

export type CreateOrderDTO = {
  shippingAddress: string;
  items: CreateOrderItemDTO[];
};
