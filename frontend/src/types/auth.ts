export interface PatientProfile {
  id: number;
  name: string;
  languagePreference: string | null;
}

export interface KioskScanRequest {
  qrData: string;
}

export interface KioskScanResponse {
  token: string;
  patient: PatientProfile;
}

export interface GenerateCardResponse {
  secureToken: string;
  patientId: number;
  patientName: string;
  issuedAt: string;
  isActive: boolean;
}

export interface ApiErrorBody {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}