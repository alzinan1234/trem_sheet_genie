// ─── Generic API Response ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage?: number;
    totalPages?: number;
  };
  data: T[];
}

// ─── Temp Media ──────────────────────────────────────────────────────────────
export interface TempMedia {
  tempMediaId: string;
  url: string;
  key: string;
  context: string;
  expiresAt: string;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  avatar: string | null;
  avatarKey: string | null;
  role: 'USER' | 'ADMIN';
  status: 'INACTIVE' | 'PENDING' | 'ACTIVE';
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  tokenVersion: number;
  passwordChangedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface RegisterResponse {
  verifyToken: string;
  newUser: User;
}

export interface LoginResponse {
  access_token: string;
  user: Pick<User, 'id' | 'email' | 'username' | 'firstName' | 'lastName' | 'phoneNumber' | 'role' | 'status' | 'isEmailVerified'>;
}

export interface VerifyEmailResponse {
  message: string;
  access_token: string;
  nextStep: string | null;
  user: User;
}

export interface SessionInfo {
  id: string;
  userId: string;
  deviceIP: string;
  deviceType: string;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Organization ─────────────────────────────────────────────────────────────
export interface Organization {
  id: string;
  userId: string;
  position: string;
  companyName: string;
  size: string;
  typeOfCompany: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Fund ────────────────────────────────────────────────────────────────────
export interface Fund {
  id: string;
  fundName: string;
  description: string;
  inceptionDate: string;
  status: 'OPEN' | 'CLOSED' | 'FULLY_INVESTED' | 'LIQUIDATED' | 'EVERGREEN';
  leadGP: string;
  committedCapital: number;
  initialClosingDate: string;
  term: number;
  commitmentPeriod: number;
  maximalExtension: number;
  commitmentPeriodManagementFee: number;
  postCommitmentPeriodManagementFee: number;
  carryType: 'AGGREGATE' | 'DEAL_BY_DEAL';
  carryPercentage: number;
  organizationId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    companyName: string;
    entityType?: string;
    userId?: string;
    position?: string;
    size?: string;
    typeOfCompany?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  createdBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateFundPayload {
  fundName: string;
  description: string;
  inceptionDate: string;
  status: string;
  leadGP: string;
  committedCapital: number;
  initialClosingDate: string;
  term: number;
  commitmentPeriod: number;
  maximalExtension: number;
  commitmentPeriodManagementFee: number;
  postCommitmentPeriodManagementFee: number;
  carryType: string;
  carryPercentage: number;
}

// ─── Limited Partner ─────────────────────────────────────────────────────────
export interface LimitedPartner {
  id: string;
  companyName: string;
  fundId: string;
  relationshipSince: string;
  agreementDate: string;
  committedCapital: number;
  capitalCalls: number;
  managementFees: number;
  carryPercentage: number;
  mainPointOfContactName: string;
  mainPointOfContactRole: string;
  mainPointOfContactEmail: string;
  mainPointOfContactPhoneNumber: string;
  fund?: {
    id: string;
    fundName: string;
    organizationId: string;
  };
}

export interface CreateLimitedPartnerPayload {
  companyName: string;
  fundId: string;
  relationshipSince: string;
  agreementDate: string;
  committedCapital: number;
  capitalCalls: number;
  managementFees: number;
  carryPercentage: number;
  mainPointOfContactName: string;
  mainPointOfContactRole: string;
  mainPointOfContactEmail: string;
  mainPointOfContactPhoneNumber: string;
}

// ─── Contact ─────────────────────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  phoneNumber: string;
  limitedPartnerId: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
  limitedPartner?: {
    id: string;
    companyName: string;
  };
}

export interface CreateContactPayload {
  name: string;
  role: string;
  email: string;
  phoneNumber: string;
  limitedPartnerId: string;
}

// ─── Document ────────────────────────────────────────────────────────────────
export interface Document {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  s3Key: string;
  s3Url: string;
  fundId: string | null;
  companyName: string | null;
  investmentRound: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    fundName: string;
  } | null;
}

// ─── Notification Settings ───────────────────────────────────────────────────
export interface NotificationSettings {
  id: string;
  userId: string;
  fundActivity: boolean;
  capitalCall: boolean;
  distribution: boolean;
  securityAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Startup ─────────────────────────────────────────────────────────────────
export interface Startup {
  id: string;
  name: string;
  website: string;
  logo: string | null;
  logoKey: string | null;
  description: string;
  status: 'ACTIVE' | 'CLOSED';
  investmentAmount: number;
  growthPercentage: number;
  fundId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    fundName: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CreateStartupPayload {
  name: string;
  fundId: string;
  website: string;
  description: string;
  status: string;
  investmentAmount: number;
  growthPercentage: number;
  tempMediaId?: string;
}

// ─── Issue ───────────────────────────────────────────────────────────────────
export interface Issue {
  id: string;
  email: string;
  title: string;
  type: 'BUG' | 'FEATURE' | 'OTHER';
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User | null;
}

// ─── Simulation ──────────────────────────────────────────────────────────────
export interface Simulation {
  id: string;
  name: string;
  description: string;
  fundId: string;
  startupId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    fundName: string;
    organizationId: string;
  };
  startup?: {
    id: string;
    name: string;
    fundId: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateSimulationPayload {
  name: string;
  fundId: string;
  startupId: string;
  description?: string;
}

// ─── Investment Pipeline ─────────────────────────────────────────────────────
export type CompanyStatus = 'CURRENTLY_FUNDRAISING' | 'MID_CYCLE' | 'NOT_RAISING' | 'CLOSED';
export type DecisionStatus = 'UNDER_REVIEW' | 'INVESTMENT_COMMITTEE' | 'TERM_SHEET' | 'DUE_DILIGENCE' | 'INVESTED' | 'PASSED';

export interface InvestmentPipeline {
  id: string;
  companyName: string;
  companyWebsite: string;
  companyLogo: string;
  companyLogoKey: string;
  companyStatus: CompanyStatus;
  decisionStatus: DecisionStatus;
  fundId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  fund?: {
    id: string;
    fundName: string;
    organizationId?: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateInvestmentPipelinePayload {
  companyName: string;
  companyWebsite: string;
  companyLogo?: string;
  companyLogoKey?: string;
  companyStatus: CompanyStatus;
  decisionStatus: DecisionStatus;
  fundId: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface PaginationParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  sort?: string;
}
