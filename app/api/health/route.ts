import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
	try {
		console.log("🏥 Health check started");

		// Check environment variables
		const envCheck = {
			DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
			NODE_ENV: process.env.NODE_ENV,
			VERCEL: process.env.VERCEL,
			VERCEL_ENV: process.env.VERCEL_ENV,
		};

		console.log("🔧 Environment check:", envCheck);

		if (!process.env.DATABASE_URL) {
			return NextResponse.json(
				{
					status: "error",
					message: "DATABASE_URL not configured",
					env: envCheck,
					timestamp: new Date().toISOString(),
				},
				{ status: 500 }
			);
		}

		// Test database connection
		console.log("🔗 Testing database connection...");
		const client = await pool.connect();

		try {
			const result = await client.query(
				"SELECT NOW() as current_time, version() as postgres_version"
			);
			const dbInfo = result.rows[0];

			console.log("✅ Database connection successful");

			return NextResponse.json({
				status: "healthy",
				message: "All systems operational",
				database: {
					connected: true,
					current_time: dbInfo.current_time,
					postgres_version: dbInfo.postgres_version.split(" ")[0], // Just version number
				},
				env: envCheck,
				timestamp: new Date().toISOString(),
			});
		} finally {
			client.release();
		}
	} catch (error) {
		console.error("❌ Health check failed:", error);

		return NextResponse.json(
			{
				status: "error",
				message: "Health check failed",
				error: error instanceof Error ? error.message : "Unknown error",
				env: {
					DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
					NODE_ENV: process.env.NODE_ENV,
					VERCEL: process.env.VERCEL,
				},
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	}
}