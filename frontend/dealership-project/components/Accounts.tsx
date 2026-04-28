import { AuthUser } from "../app/types";

export interface DemoAccount extends AuthUser {
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 1,
    firstName: "REDACTED",
    lastName:  "REDACTED",
    username:  "admin",
    email:     "REDACTED",
    role:      "General Manager",
    employeeId: "EMP-0001",
    startDate:  "REDACTED",
    password:  "admin123",
  },
  {
    id: 2,
    firstName: "REDACTED",
    lastName:  "REDACTED",
    username:  "sales1",
    email:     "REDACTED",
    role:      "Sales Associate",
    employeeId: "EMP-0002",
    startDate:  "REDACTED",
    password:  "sales2024",
  },
  {
    id: 3,
    firstName: "REDACTED",
    lastName:  "REDACTED",
    username:  "lot1",
    email:     "REDACTED",
    role:      "Lot Manager",
    employeeId: "EMP-0003",
    startDate:  "REDACTED",
    password:  "lotsecure",
  },
];