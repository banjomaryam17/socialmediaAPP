import { Pool } from "pg";

// Log database configuration (without exposing sensitive data)
console.log("🔧 Database configuration:", {
	NODE_ENV: process.env.NODE_ENV,
	DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
	DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
	DATABASE_URL_STARTS_WITH:
		process.env.DATABASE_URL?.substring(0, 10) || "undefined",
});

if (!process.env.DATABASE_URL) {
	console.error("❌ DATABASE_URL environment variable is not set");
	throw new Error("DATABASE_URL environment variable is required");
}

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
	ssl:
		process.env.NODE_ENV === "production"
			? { rejectUnauthorized: false }
			: false,
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 10000, // Increased timeout for Vercel
});

// Test the connection on startup
pool.on("connect", (client) => {
	console.log("✅ New database client connected");
});

pool.on("error", (err) => {
	console.error("❌ Unexpected error on idle client:", err);
});

// Test connection
pool
	.connect()
	.then((client) => {
		console.log("✅ Database pool connection test successful");
		client.release();
	})
	.catch((err) => {
		console.error("❌ Database pool connection test failed:", err);
	});

export default pool;