export type PageKey =
  | "login"
  | "signup"
  | "welcome"
  | "lot"
  | "inventory"
  | "profile";

export type UserRole =
  | "Sales Associate"
  | "Finance Manager"
  | "Lot Manager"
  | "Service Advisor"
  | "General Manager";

export interface AuthUser {
  id:          number;
  firstName:   string;
  lastName?:   string;
  username:    string;
  email:       string;
  role:        UserRole;
  employeeId:  string;
  startDate:   string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName:  string;
  username:  string;
  email:     string;
  password:  string;
  role:      UserRole;
}

export type VehicleStatus = "available" | "hold" | "sold" | "incoming";

export interface Vehicle {
  id:              number;
  vin:             string;  
  year:            number;   
  make:            string;   
  model:           string;   
  trim:            string;   
  color:           string;   
  mileage:         number;  
  price:           number;   
  status:          VehicleStatus;
  location:             string;   
  daysOnLot:       number;   
  addedByUserId?:  number;   
  createdAt?:      string;   
  updatedAt?:      string;   
  image?:          string;
}


export type VehicleCreatePayload = Omit<
  Vehicle,
  "id" | "daysOnLot" | "createdAt" | "updatedAt"
>;


export type VehicleUpdatePayload = Partial<VehicleCreatePayload>;


export interface DashboardStats {
  totalOnLot:         number;
  salesThisMonth:     number;
  avgDaysOnLot:       number;
  pendingAppraisals:  number;
}

export interface ActivityItem {
  id:          number;
  icon:        string;
  description: string;
  detail:      string;
  createdAt:   string; 
}

export interface AlertItem {
  id:         number;
  boldPrefix: string;
  message:    string;
  critical:   boolean;
}

export interface EmployeeStats {
  vehiclesAdded: number;
  salesClosed:   number;
  appraisals:    number;
}

export interface ActivityLog {
  id:        number;
  action:    string;
  detail:    string;
  createdAt: string; 
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword:     string;
}

export interface UpdateProfilePayload {
  firstName: string;
  lastName:  string;
  username:  string;
  email:     string;
}