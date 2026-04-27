export type PageKey = "welcome" | "lot" | "inventory" | "profile";

export interface AuthUser {
  firstName: string;
  lastName?: string;
  role: string;
}

export type VehicleStatus = "available" | "hold" | "sold" | "incoming";

export interface Vehicle {
  id: number;
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  color: string;
  mileage: number;
  price: number;
  status: VehicleStatus;
  lot: string;
  daysOnLot: number;
}