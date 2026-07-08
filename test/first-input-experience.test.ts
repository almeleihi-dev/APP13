import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dirname, "..");

function read(path: string): string {
  return readFileSync(join(ROOT, path), "utf8");
}

describe("AN ACT First Input Experience", () => {
  it("imports first input experience stylesheet", () => {
    assert.match(read("apps/web/src/styles/global.css"), /an-act-first-input-experience\.css/);
  });

  it("defines voice and file beta helpers", () => {
    const helpers = read("apps/web/src/launch/first-input-experience.ts");
    assert.match(helpers, /isSpeechRecognitionSupported/);
    assert.match(helpers, /createSpeechRecognition/);
    assert.match(helpers, /extractGoalFromFile/);
    assert.match(helpers, /Tell an act what you want to accomplish/);
  });

  it("activates beta voice and file tabs on Act Builder", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    assert.match(builder, /Record Voice/);
    assert.match(builder, /Upload File/);
    assert.match(builder, /method-badge--beta/);
    assert.match(builder, /useVoiceGoalCapture/);
    assert.doesNotMatch(builder, /launch-builder__method--soon/);
    assert.doesNotMatch(builder, /Soon/);
  });

  it("unifies goal text across input methods", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    assert.match(builder, /goalText/);
    assert.match(builder, /builder\.buildPreview|builder\.discoverActions/);
    assert.match(builder, /FIRST_INPUT_JOURNEY_HINT/);
  });

  it("stores file evidence note on launch draft", () => {
    const nav = read("apps/web/src/launch/navigation.ts");
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    assert.match(nav, /evidenceNote/);
    assert.match(builder, /evidenceNote/);
  });

  it("protects main journey to preview", () => {
    const builder = read("apps/web/src/launch/ActBuilderPage.tsx");
    assert.match(builder, /navigate\("\/preview"\)/);
    assert.match(builder, /saveLaunchActDraft/);
  });
});
