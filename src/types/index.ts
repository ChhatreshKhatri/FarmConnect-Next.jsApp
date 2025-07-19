export interface User {
  UserId?: string;
  Email: string;
  Password: string;
  Username: string;
  MobileNumber: string;
  UserRole: string;
}

export interface UserInfo {
  Name: string;
  Id: string;
  UserName: string;
  NormalizedUserName: string;
  Email: string;
  NormalizedEmail: string;
  EmailConfirmed: boolean;
  PasswordHash: string;
  SecurityStamp: string;
  ConcurrencyStamp: string;
  PhoneNumber: string;
  PhoneNumberConfirmed: boolean;
  TwoFactorEnabled: boolean;
  LockoutEnd: string | null;
  LockoutEnabled: boolean;
  AccessFailedCount: number;
}

export interface LoginRequest {
  Email: string;
  Password: string;
}

export interface Medicine {
  MedicineId?: number;
  MedicineName: string;
  Brand: string;
  Category: string;
  Description: string;
  Quantity: number;
  Unit: string;
  PricePerUnit: number;
  Image: string;
  UserId: string;
  User?: UserInfo;
}

export interface Feed {
  FeedId?: number;
  FeedName: string;
  Type: string;
  Description: string;
  Quantity: number;
  Unit: string;
  PricePerUnit: number;
  Image: string;
  UserId: string;
  User?: UserInfo;
}

export interface Livestock {
  LivestockId: number;
  Name: string;
  Species: string;
  Age: number;
  Breed: string;
  HealthCondition?: string;
  Location: string;
  VaccinationStatus?: string;
  UserId: string;
  User?: UserInfo;
}

export interface Request {
  RequestId?: number;
  RequestType: string;
  MedicineId?: number | null;
  FeedId?: number | null;
  UserId: string;
  Quantity: number;
  Status: string;
  LivestockId: number; // This is required according to API
  RequestDate: string;
  User?: UserInfo;
}

export interface Feedback {
  FeedbackId: number;
  UserId: string;
  User?: UserInfo;
  FeedbackText: string;
  Date: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}
