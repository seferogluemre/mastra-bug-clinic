
import { LibSQLStore } from "@mastra/libsql";

try {
    const connectionUrl = new URL("postgresql://postgres:postgres@localhost:5432/mastra-elysia-api?schemas=public");
    connectionUrl.searchParams.delete("schema");
    connectionUrl.searchParams.delete("schemas");

    const storage = new LibSQLStore({
        url: connectionUrl.toString(),
    });
    console.log("Success: LibSQLStore initialized without error");
} catch (e) {
    console.error(e);
}
