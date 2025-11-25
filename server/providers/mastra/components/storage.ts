import { PostgresStore } from "@mastra/pg";

const connectionString = process.env.DATABASE_URL!;

const storage = new PostgresStore({
    connectionString,
});

export { storage };