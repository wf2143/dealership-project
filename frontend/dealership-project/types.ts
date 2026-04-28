export type PageKey = "welcome" | "lot" | "inventory" | "profile";

export type UserRole =
  | "Sales Associate"
  | "Finance Manager"
  | "Lot Manager"
  | "Service Advisor"
  | "General Manager";

export interface AuthUser {
  id: number;
  firstName: string;
  lastName?: string;
  role: UserRole;
  username: string;
  email: string;
  employeeId: string;
  startDate: string
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