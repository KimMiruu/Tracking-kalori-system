import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request) {
    let db;

    try {
        const body = await request.json();
        const { email, password } = body;

        // Validasi input
        if (!email || !password) {
            return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
        }

        // Koneksi ke database
        db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "simplefit_db",
        });

        // Cek apakah email ada di database
        const [rows] = await db.execute(
            "SELECT id_user FROM users WHERE email = ?", [email]
        );

        if (rows.length === 0) {
            return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await db.execute(
            "UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]
        );

        return NextResponse.json({ message: "Password berhasil diperbarui!" }, { status: 200 });

    } catch (error) {
        console.error("❌ Error server:", error.message);
        return NextResponse.json({ message: "Terjadi kesalahan pada server.", error: error.message }, { status: 500 });


    } finally {
        if (db) await db.end();
    }
}