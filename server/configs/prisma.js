import 'dotenv/config';
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

// Let Neon parse the connection string internally
neonConfig.connectionString = process.env.DATABASE_URL;

// Create adapter WITHOUT passing the URL
const adapter = new PrismaNeon();

// Normal Prisma client + adapter
const prisma = global.prisma || new PrismaClient({
  adapter
});

// Keep prisma global in dev
if (process.env.NODE_ENV === "development") {
  global.prisma = prisma;
}

export default prisma;
