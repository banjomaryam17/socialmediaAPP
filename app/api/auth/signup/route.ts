import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
	let client;

	try {
		console.log("📥 Signup request received");

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

		const body = await req.json();
		const { username, password, firstName, lastName, avatarUrl } = body;
		console.log("📋 Signup data received:", {
			username,
			firstName,
			lastName,
			hasPassword: !!password,
		});

		if (!username || !password) {
			return NextResponse.json(
				{
					error: "Missing required fields",
					details: "Username and password are required",
				},
				{ status: 400 }
			);
		}

		console.log("🔗 Attempting database connection...");
		client = await pool.connect();
		console.log("✅ Database connected successfully");

		console.log("🔐 Importing bcrypt...");
		const bcrypt = await import("bcrypt");
		console.log("✅ Bcrypt imported successfully");

		console.log("🔍 Checking if user already exists...");
		const userCheck = await client.query(
			"SELECT * FROM users WHERE username = $1",
			[username]
		);
		console.log("📊 User check returned", userCheck.rows.length, "rows");

		if (userCheck.rows.length > 0) {
			console.log("❌ User already exists:", username);
			return NextResponse.json(
				{ error: "User already exists" },
				{ status: 400 }
			);
		}

		console.log("🔐 Hashing password...");
		const hashedPassword = await bcrypt.hash(password, 10);
		console.log("✅ Password hashed successfully");

		console.log("💾 Inserting new user into database...");
		const result = await client.query(
			"INSERT INTO users (username, password, first_name, last_name, avatar_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[username, hashedPassword, firstName, lastName, avatarUrl]
		);
		console.log("✅ User created successfully:", result.rows[0]?.username);

		// Remove password from response
		const userResponse = { ...result.rows[0] };
		delete userResponse.password;

		return NextResponse.json(
			{
				message: "User created successfully",
				user: userResponse,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("❌ Signup error details:", {
			message: error instanceof Error ? error.message : "Unknown error",
			stack: error instanceof Error ? error.stack : undefined,
			name: error instanceof Error ? error.name : typeof error,
			env: {
				NODE_ENV: process.env.NODE_ENV,
				DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
				DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
			},
		});

		return NextResponse.json(
			{
				error: "Internal server error",
				details:
					error instanceof Error ? error.message : "Unknown error occurred",
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