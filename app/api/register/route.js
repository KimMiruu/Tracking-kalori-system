import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();
        const { username, email, password, usia, berat, tinggi, jenis_kelamin, target_kalori } = body;

        // Validasi input wajib
        if (!username || !email || !password) {
            return NextResponse.json({ message: "Username, email, dan password wajib diisi!" }, { status: 400 });
        }

        // Enkripsi password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Koneksi ke database
        const db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "simplefit_db",
            port: 3306,
        });

        // Cek apakah email sudah ada
        const [existingUser] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
        if (existingUser.length > 0) {
            await db.end();
            return NextResponse.json({ message: "Email sudah terdaftar!" }, { status: 409 });
        }

        // Simpan user baru
        await db.execute(
            `INSERT INTO users 
        (username, email, password, usia, berat, tinggi, jenis_kelamin, target_kalori)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
                username,
                email,
                hashedPassword,
                usia || null,
                berat || null,
                tinggi || null,
                jenis_kelamin || null,
                target_kalori || null,
            ]
        );

        await db.end();
        return NextResponse.json({ message: "Registrasi berhasil!" }, { status: 201 });
    } catch (err) {
        console.error("Error saat register:", err);
        return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
    }
}