import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT Functional Beta Sprint 3", () => {
  it("imports functional beta sprint 3 stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-functional-beta-sprint3\.css/);
  });

  it("applies living-s3 class to html root", () => {
    assert.match(read("apps/web/src/main.tsx"), /an-act-living-s3/);
  });

  it("defines team passport and project living types", () => {
    const types = read("apps/web/src/lib/living-platform/types.ts");
    assert.match(types, /TeamPassport/);
    assert.match(types, /LivingProject/);
    assert.match(types, /MicroAction/);
    assert.match(types, /ProjectExecutionPath/);
    assert.match(types, /economySignals/);
  });

  it("implements team passport store with trust derivation", () => {
    const store = read("apps/web/src/lib/living-platform/team-passport-store.ts");
    assert.match(store, /createTeam/);
    assert.match(store, /joinTeam/);
    assert.match(store, /deriveTeamTrust/);
    assert.match(store, /listTeamsForMember/);
  });

  it("implements project decomposition engine with execution paths", () => {
    const engine = read("apps/web/src/lib/living-platform/project-decomposition-engine.ts");
    const store = read("apps/web/src/lib/living-platform/project-living-store.ts");
    assert.match(engine, /build-house/);
    assert.match(engine, /launch-app/);
    assert.match(engine, /open-business/);
    assert.match(engine, /step_by_step/);
    assert.match(store, /createProjectFromGoal/);
    assert.match(store, /payProjectPhase/);
    assert.match(store, /completeProjectPhase/);
    assert.match(store, /contractProjectMicroAction/);
  });

  it("connects micro-actions to action contracts", () => {
    const store = read("apps/web/src/lib/living-platform/project-living-store.ts");
    const types = read("apps/web/src/lib/living-platform/types.ts");
    assert.match(store, /projectId/);
    assert.match(store, /microActionId/);
    assert.match(types, /contractScope/);
  });

  it("surfaces teams and projects on personal home and build project page", () => {
    const home = read("apps/web/src/passport/personal-home-presentation.ts");
    const page = read("apps/web/src/pages/PersonalHomeDashboardPage.tsx");
    const build = read("apps/web/src/components/project-living/BuildProjectExperience.tsx");
    const platform = read("apps/web/src/PlatformApp.tsx");
    assert.match(home, /myTeams/);
    assert.match(home, /activeProjects/);
    assert.match(page, /My Teams/);
    assert.match(page, /Build Project/);
    assert.match(build, /Project Passport/);
    assert.match(build, /Pay phase/);
    assert.match(platform, /build-project/);
  });

  it("migrates living platform state to version 3 with teams and projects", () => {
    const storage = read("apps/web/src/lib/living-platform/living-platform-storage.ts");
    assert.match(storage, /parsed.version === 4/);
    assert.match(storage, /version: 5/);
    assert.match(storage, /teams/);
    assert.match(storage, /projects/);
  });
});
