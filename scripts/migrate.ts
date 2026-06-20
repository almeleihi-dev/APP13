import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.resolve(__dirname, "../database/migrations");

async function ensureMigrationsTable(client: pg.Client): Promise<void> {
  await client.query("CREATE SCHEMA IF NOT EXISTS platform");
  await client.query(`
    CREATE TABLE IF NOT EXISTS platform.schema_migrations (
      version     TEXT PRIMARY KEY,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

async function appliedVersions(client: pg.Client): Promise<Set<string>> {
  const result = await client.query<{ version: string }>(
    "SELECT version FROM platform.schema_migrations ORDER BY version"
  );
  return new Set(result.rows.map((row) => row.version));
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();

  try {
    await ensureMigrationsTable(client);
    const applied = await appliedVersions(client);

    const files = (await readdir(migrationsDir))
      .filter((name) => name.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const version = file.replace(/\.sql$/, "");
      if (applied.has(version)) {
        console.log(`skip  ${version}`);
        continue;
      }

      const sql = await readFile(path.join(migrationsDir, file), "utf8");
      console.log(`apply ${version}`);
      await client.query(sql);
      await client.query(
        "INSERT INTO platform.schema_migrations (version) VALUES ($1)",
        [version]
      );
    }

    console.log("migrations complete");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
