import Database from "@tauri-apps/plugin-sql";
const db = await Database.load("sqlite:chat.db");
await db.execute("INSERT INTO ...");
