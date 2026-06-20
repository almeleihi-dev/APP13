import type { DbPool } from "../../shared/db/index.js";
import type { AuthContext } from "../../shared/auth/index.js";
import { AppError, ErrorCodes, problem } from "../../shared/errors/index.js";
import { IdentityRepository, identityRepository } from "../infrastructure/index.js";
import { platformRolesForUser, type PlatformRole, type User } from "../domain/index.js";

/** P0-S1 — DB revalidation of tier/roles on gated mutations */
export class IdentityRevalidationService {
  constructor(
    private readonly db: DbPool,
    private readonly identityRepo: IdentityRepository = identityRepository
  ) {}

  async revalidate(ctx: AuthContext): Promise<AuthContext> {
    const user = await this.identityRepo.findUserById(this.db.pool, ctx.userId);
    if (!user) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
        })
      );
    }
    if (user.status !== "active") {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.ACCOUNT_SUSPENDED,
          engine: "identity",
        })
      );
    }

    const dbRoles = platformRolesForUser(user);
    if (!rolesMatch(ctx.roles, dbRoles)) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.ROLES_STALE,
          engine: "identity",
        })
      );
    }

    if (ctx.tier !== user.verificationTier) {
      throw new AppError(
        problem({
          title: "Forbidden",
          status: 403,
          code: ErrorCodes.TIER_STALE,
          engine: "identity",
        })
      );
    }

    return { ...ctx, tier: user.verificationTier, roles: dbRoles, status: user.status };
  }

  async loadUser(userId: string): Promise<User> {
    const user = await this.identityRepo.findUserById(this.db.pool, userId);
    if (!user) {
      throw new AppError(
        problem({
          title: "Unauthorized",
          status: 401,
          code: ErrorCodes.UNAUTHORIZED,
          engine: "identity",
        })
      );
    }
    return user;
  }
}

function rolesMatch(jwtRoles: PlatformRole[], dbRoles: PlatformRole[]): boolean {
  if (jwtRoles.length !== dbRoles.length) return false;
  const jwtSet = new Set(jwtRoles);
  for (const role of dbRoles) {
    if (!jwtSet.has(role)) return false;
  }
  return true;
}

export function createIdentityRevalidationService(
  db: DbPool,
  identityRepo?: IdentityRepository
): IdentityRevalidationService {
  return new IdentityRevalidationService(db, identityRepo);
}
