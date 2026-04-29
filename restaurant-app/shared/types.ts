export interface User {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  image?: string;
  rating: number;
  deliveryFee: number;
  eta: number;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  status: OrderStatus;
  total: number;
  deliveryFee: number;
  subtotal: number;
  couponCode?: string;
  discount: number;
  deliveryAddress?: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
  restaurant?: Restaurant;
  orderItems?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  unitPrice: number;
  menuItem?: MenuItem;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreateOrderRequest {
  restaurantId: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  paymentMethod: string;
  couponCode?: string;
}
