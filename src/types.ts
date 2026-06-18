import { Dish } from "./data";

export type RoleType = 'client' | 'livreur' | 'gerant' | 'admin';

export interface Account {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: RoleType;
  profilePhoto: string; // image content or preset mockup
  cniPhoto: string;      // National ID mockup url or status
  restaurantId?: string; // For restaurant managers
  verified: boolean;
  createdAt: string;
  referralCode?: string;
  referredByCode?: string;
  referralCredit?: number; // referral discount balance in FCFA
}

export interface GPSCoords {
  lat: number;
  lng: number;
  label: string;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientCoords: GPSCoords;
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tip?: number;
  total: number;
  paymentMethod: 'orange' | 'mtn' | 'wave' | 'cash'; // Mobile money or Cash (espèces)
  status: 'pending' | 'preparing' | 'ready' | 'delivering' | 'delivered';
  livreurId?: string;
  livreurName?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  senderRole: 'client' | 'livreur' | 'gerant' | 'admin' | 'system';
  text: string;
  timestamp: string;
}

export interface GlobalStaffMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: RoleType;
  recipientRole?: RoleType | "all-staff" | "livreurs" | "gerants";
  text: string;
  timestamp: string;
}
