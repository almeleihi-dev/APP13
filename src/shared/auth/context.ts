/** Session actor context — P0-S1 DB revalidation target */
export type UserRole = "customer" | "provider" | "admin";

export type PlatformRole =
  | "customer"
  | "provider"
  | "verification_analyst"
  | "complaint_adjudicator"
  | "trust_ops"
  | "platform_admin"
  | "super_admin";

export interface AuthContext {
  userId: string;
  roles: PlatformRole[];
  tier: string;
  status: "active" | "suspended" | "deactivated";
  sessionId?: string;
}
