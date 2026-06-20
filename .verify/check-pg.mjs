import pg from "pg";

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://app13:app13@127.0.0.1:5432/app13",
  connectionTimeoutMillis: 3000,
});

client
  .connect()
  .then(() => client.query("SELECT 1"))
  .then(() => {
    console.log("PG_AVAILABLE");
    return client.end();
  })
  .catch((error) => {
    console.log("PG_UNAVAILABLE", error.code ?? error.message);
    process.exit(0);
  });
