import { createSecretKey } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { AppConfig } from "../../shared/config/index.js";
import type { PlatformRole, VerificationTier } from "../domain/user.js";

export interface AccessTokenClaims {
  sub: string;
  roles: PlatformRole[];
  tier: VerificationTier;
  session_id: string;
}

export class JwtService {
  private readonly secret: ReturnType<typeof createSecretKey>;

  constructor(private readonly config: AppConfig["jwt"]) {
    this.secret = createSecretKey(Buffer.from(config.secret, "utf8"));
  }

  async signAccessToken(claims: AccessTokenClaims): Promise<string> {
    return new SignJWT({
      roles: claims.roles,
      tier: claims.tier,
      session_id: claims.session_id,
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
    return {
      sub: payload.sub,
      roles: (payload.roles as PlatformRole[]) ?? [],
      tier: (payload.tier as VerificationTier) ?? "T0",
      session_id: String(payload.session_id ?? ""),
    };
  }
}

export function createJwtService(config: AppConfig): JwtService {
  return new JwtService(config.jwt);
}
