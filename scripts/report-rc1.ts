#!/usr/bin/env tsx
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createReleaseModule,
} from "../src/release/module.js";
import {
  renderArchitectureSummaryMarkdown,
  renderOperationalChecklistMarkdown,
  renderReadinessReportMarkdown,
} from "../src/release/domain/release-readiness.js";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { releaseReadiness } = createReleaseModule({ rootDir });

const releaseDir = path.join(rootDir, "docs/release");
await mkdir(releaseDir, { recursive: true });

// Seed release docs so documentation audit passes, then regenerate final report.
await Promise.all([
  writeFile(path.join(releaseDir, "RC1-Readiness-Report.md"), "# placeholder\n", "utf8"),
  writeFile(path.join(releaseDir, "RC1-Architecture-Summary.md"), "# placeholder\n", "utf8"),
  writeFile(path.join(releaseDir, "RC1-Operational-Checklist.md"), "# placeholder\n", "utf8"),
]);

const report = await releaseReadiness.analyze();

await Promise.all([
  writeFile(
    path.join(releaseDir, "RC1-Readiness-Report.md"),
    renderReadinessReportMarkdown(report),
    "utf8"
  ),
  writeFile(
    path.join(releaseDir, "RC1-Architecture-Summary.md"),
    renderArchitectureSummaryMarkdown(report),
    "utf8"
  ),
  writeFile(
    path.join(releaseDir, "RC1-Operational-Checklist.md"),
    renderOperationalChecklistMarkdown(report),
    "utf8"
  ),
]);

console.log(`RC-1 status: ${report.status}`);
console.log(`Readiness score: ${report.readinessScore}/100`);
console.log(`Reports written to docs/release/`);

if (report.status === "blocked") {
  process.exit(1);
}
