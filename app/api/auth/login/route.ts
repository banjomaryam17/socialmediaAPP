import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
	let client;

	try {
		console.log("📥 Login request received");

		// Check if DATABASE_URL is available
		if (!process.env.DATABASE_URL) {
			console.error("❌ DATABASE_URL environment variable is not set");
			return NextResponse.json(
				{
					error: "Database configuration missing",
					details: "DATABASE_URL not configured",
				},
				{ status: 500 }
			);
		}

		console.log("🔗 Attempting database connection...");
		client = await pool.connect();
		console.log("✅ Database connected successfully");

		const body = await req.json();
		const { username, password } = body;
		console.log("👤 Username:", username);
		console.log("📋 Request body keys:", Object.keys(body));

		if (!username || !password) {
			return NextResponse.json(
				{
					error: "Missing credentials",
					details: "Username and password are required",
				},
				{ status: 400 }
			);
		}

		console.log("🔐 Importing bcrypt...");
		const bcrypt = await import("bcrypt");
		console.log("✅ Bcrypt imported successfully");

		console.log("🔍 Querying database for user...");
		const result = await client.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);
		const user = result.rows[0];
		console.log("📄 User query result:", user ? "User found" : "No user found");
		console.log("📊 Query returned", result.rows.length, "rows");

		if (!user) {
			console.log("❌ No user found with username:", username);
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		console.log("🔐 Comparing passwords...");
		const isMatch = await bcrypt.compare(password, user.password);
		console.log("🔐 Password match:", isMatch);

		if (!isMatch) {
			return NextResponse.json({ error: "Invalid password" }, { status: 401 });
		}

		console.log("✅ Login successful for user:", username);
		return NextResponse.json(
			{
				message: "Login successful",
				user: { id: user.id, username: user.username },
			},
			{ status: 200 }
		);
	} catch (err: unknown) {
		console.error("❌ Login error details:", {
			message: err instanceof Error ? err.message : "Unknown error",
			stack: err instanceof Error ? err.stack : undefined,
			name: err instanceof Error ? err.name : typeof err,
			env: {
				NODE_ENV: process.env.NODE_ENV,
				DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
				DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
			},
		});

		return NextResponse.json(
			{
				error: "Internal server error",
				details: err instanceof Error ? err.message : "Unknown error occurred",
				timestamp: new Date().toISOString(),
			},
			{ status: 500 }
		);
	} finally {
		if (client) {
			try {
				client.release();
				console.log("🔓 Database connection released");
			} catch (releaseErr) {
				console.error("❌ Error releasing database connection:", releaseErr);
			}
		}
	}
}