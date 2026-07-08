import { createSecretKey } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { AppConfig } from "../../shared/config/index.js";
import type { PlatformRole, VerificationTier } from "../domain/user.js";

export interface AccessTokenClaims {
  sub: string;
  role: string;
  roles: PlatformRole[];
  tier: VerificationTier;
  session_id: string;
  sessionId: string;
}

function primaryRoleFromRoles(roles: PlatformRole[]): string {
  if (roles.includes("super_admin") || roles.includes("platform_admin")) {
    return "admin";
  }
  if (roles.includes("provider")) {
    return "provider";
  }
  return "customer";
}

export class JwtService {
  private readonly secret: ReturnType<typeof createSecretKey>;

  constructor(private readonly config: AppConfig["jwt"]) {
    this.secret = createSecretKey(Buffer.from(config.secret, "utf8"));
  }

  async signAccessToken(
    claims: Omit<AccessTokenClaims, "role" | "sessionId"> & {
      role?: string;
      sessionId?: string;
    }
  ): Promise<string> {
    const role = claims.role ?? primaryRoleFromRoles(claims.roles);
    const sessionId = claims.sessionId ?? claims.session_id;
    return new SignJWT({
      role,
      roles: claims.roles,
      tier: claims.tier,
      session_id: claims.session_id,
      sessionId,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(claims.sub)
      .setIssuer(this.config.issuer)
      .setIssuedAt()
      .setExpirationTime(`${this.config.accessTtlSeconds}s`)
      .sign(this.secret);
  }

  async verifyAccessToken(token: string): Promise<AccessTokenClaims> {
    const { payload } = await jwtVerify(token, this.secret, {
      issuer: this.config.issuer,
    });
    if (!payload.sub || typeof payload.sub !== "string") {
      throw new Error("INVALID_TOKEN");
    }
    const roles = (payload.roles as PlatformRole[]) ?? [];
    const sessionId = String(payload.sessionId ?? payload.session_id ?? "");
    return {
      sub: payload.sub,
      role: String(payload.role ?? primaryRoleFromRoles(roles)),
      roles,
      tier: (payload.tier as VerificationTier) ?? "T0",
      session_id: sessionId,
      sessionId,
    };
  }
}

export function createJwtService(config: AppConfig): JwtService {
  return new JwtService(config.jwt);
}
