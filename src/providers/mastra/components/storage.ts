import { LibSQLStore } from "@mastra/libsql";

const storage = new LibSQLStore({
    url: process.env.DATABASE_URL!,
});

export { storage };