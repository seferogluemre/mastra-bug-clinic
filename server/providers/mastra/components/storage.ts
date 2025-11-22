import { LibSQLStore } from "@mastra/libsql";

const connectionUrl = process.env.MASTRA_DATABASE_URL || "file:mastra.db";

const storage = new LibSQLStore({
    url: connectionUrl,
});

export { storage };