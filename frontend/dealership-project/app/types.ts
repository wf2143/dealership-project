export type PageKey =
  | "login"
  | "welcome"
  | "inventory"
  | "customers"
  | "sales"
  | "profile";

export type EmployeeRole =
  | "Sales Associate"
  | "Finance Manager"
  | "Lot Manager"
  | "Service Advisor"
  | "General Manager";

export interface AuthEmployee {
  id:        number;
  firstName: string;
  lastName?: string;
  username:  string;
  email:     string;
  role:      EmployeeRole;
  startDate: string;
}

export type VehicleStatus = "available" | "hold" | "sold" | "incoming";

export interface Vehicle {
  id:        number;
  vin:       string;
  year:      number;
  make:      string;
  model:     string;
  trim:      string;
  color:     string;
  mileage:   number;
  price:     number;
  bodyType:  string;
  fuelType:  string;
  status:    VehicleStatus;
  lot:       string;
  addDate:   string;
}

export interface Customer {
  customerId: number;
  name:       string;
  phone:      string;
  email:      string;
}

export interface SaleTransaction {
  transactionId: number;
  date:          string | number[];
  amount:        number;
  paymentType:   string;
  customer:      Customer;
  vehicle:       Vehicle;
}
