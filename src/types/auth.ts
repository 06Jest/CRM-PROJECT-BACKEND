import { Roles } from "./global";

export interface SignUpDTO {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  org_name: string;
}

export interface SignInDTO {
  email: string;
  password: string;
}


export interface EmailDTO {
  email: string;
}

export interface UpdatePasswordDTO {
  password: string;
}

export interface AccessTokenPayload {
  sub: string;
  role: Roles;
  orgId: string | null;
}

export interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export interface AuthenticatedProfile {
  id: string;
  orgId: string | null;
  role: Roles;
  email: string | null;
  employeeId: string | null;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordDTO {
  id: string;
  email: string;
  current_password: string;
  new_password: string;
}