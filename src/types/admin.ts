// ============ Event Types ============

export interface EventData {
  id: string;
  name: string;
  year: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  registrationOpensAt: Date | null;
  registrationClosesAt: Date | null;
}

// ============ Station Types ============

export interface Station {
  id: string;
  name: string;
  stationType: string;
  isActive: boolean;
  maxVisitsPerHacker: number | null;
}

export interface StationStats {
  stationId: string;
  stationName: string;
  stationType: string;
  isActive: boolean;
  maxVisitsPerHacker: number | null;
  totalCheckIns: number;
  uniqueHackers: number;
}

// ============ Registration Types ============

export interface HackerProfile {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email?: string;
}

export interface Education {
  school?: { name: string };
  levelOfStudy?: string;
}

export interface DietaryRestriction {
  name: string;
  allergyDetails: string | null;
}

export interface CheckInRecord {
  id: string;
  stationId: string;
  stationName: string;
  stationType: string;
  checkedInAt: Date;
}

export interface HackerInfo {
  id: string;
  qrCode: string;
  isComplete: boolean;
  hackerProfile: HackerProfile;
  dietaryRestrictions: DietaryRestriction[];
  checkIns: CheckInRecord[];
}

export interface Registration {
  id: string;
  qrCode: string;
  ageAtEvent: number;
  isComplete: boolean;
  createdAt: Date;
  hackerProfile: HackerProfile;
  education?: Education;
  dietaryRestrictions?: { dietaryRestriction: { name: string }; allergyDetails?: string | null }[];
}

// ============ Server Action Response Types ============

export interface ActionError {
  error: string;
}

export interface ActionSuccess {
  success: true;
}

export type ActionResult<T> = T | ActionError;
