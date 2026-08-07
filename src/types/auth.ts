import { JwtPayload } from "jsonwebtoken";
import { Roles } from "./global";

export interface SignUpDTO {
  email: string;
  password: string;
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

export interface AccessTokenPayload extends JwtPayload {
  aud: string | string[];
  iss: string;
  sub: string; 
  role: "authenticated";
  email: string;
  org_id: string | null;
  member_id: string | null;
  user_metadata: {
    role: Roles | null;
  };
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