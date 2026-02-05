import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const { email, password } = await req.json();

        const connection = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "simplefit_db",
            port: 3306,
        });

        // Ambil user
        const [rows] = await connection.execute(
            "SELECT id_user, username, email, password, target_kalori FROM users WHERE email = ?", [email]
        );

        if (rows.length === 0) {
            await connection.end();
            return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 401 });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            await connection.end();
            return NextResponse.json({ success: false, message: "Password salah" }, { status: 401 });
        }

        delete user.password;

        // ==============================
        // 🔥 Tambahan penting supaya TIDAK RESET SETIAP LOGIN
        // ==============================
        const today = new Date().toISOString().split("T")[0];

        const [tracking] = await connection.execute(
            "SELECT * FROM tb_tracking WHERE id_user = ? AND tanggal = ?", [user.id_user, today]
        );

        await connection.end();

        return NextResponse.json({
            success: true,
            message: "Login berhasil",
            user,
            tracking: tracking.length > 0 ? tracking[0] : null,
        });

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ success: false, message: "Terjadi kesalahan server" }, { status: 500 });
    }
}