export interface User {
  UserId?: number;
  Email: string;
  Password: string;
  Username: string;
  MobileNumber: string;
  UserRole: string;
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
  UserId: number;
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
  UserId: number;
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
  UserId: number;
}

export interface Request {
  RequestId?: number;
  RequestType: string;
  MedicineId?: number | null;
  FeedId?: number | null;
  UserId: number;
  Quantity: number;
  Status: string;
  LivestockId: number; // This is required according to API
  RequestDate: string;
}

export interface Feedback {
  FeedbackId: number;
  UserId: number;
  FeedbackText: string;
  Date: string;
}

export interface AuthResponse {
  token: string;
  message: string;
}
