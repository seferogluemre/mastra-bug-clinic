
import { LibSQLStore } from "@mastra/libsql";

try {
    const connectionUrl = new URL("postgresql://user:password@localhost:5432/mydb?schema=public&schemas=public");
    connectionUrl.searchParams.delete("schema");
    connectionUrl.searchParams.delete("schemas");

    const storage = new LibSQLStore({
        url: connectionUrl.toString(),
    });
    console.log("Success: LibSQLStore initialized without error");
} catch (e) {
    console.error(e);
}
