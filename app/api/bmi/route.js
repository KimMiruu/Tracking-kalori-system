import { db } from "@/lib/db";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id_user = searchParams.get("id_user");

        if (!id_user) {
            return Response.json({ error: "ID user tidak ditemukan" }, { status: 400 });
        }

        const [rows] = await db.query(
            `SELECT id_user, username, email, usia, berat, tinggi, jenis_kelamin, target_kalori
       FROM users
       WHERE id_user = ?`, [id_user]
        );

        if (rows.length === 0) {
            return Response.json({ error: "Data tidak ditemukan" }, { status: 404 });
        }

        const user = rows[0];

        if (user.tinggi && user.berat) {
            const tinggiMeter = user.tinggi / 100;
            const bmi = user.berat / (tinggiMeter * tinggiMeter);
            user.bmi = parseFloat(bmi.toFixed(2));
        } else {
            user.bmi = null;
        }

        return Response.json(user);
    } catch (error) {
        console.error("Error GET /api/bmi:", error);
        return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const { id_user, usia, berat, tinggi, jenis_kelamin, target_kalori } = body;

        if (!id_user) {
            return Response.json({ error: "ID user tidak ditemukan" }, { status: 400 });
        }

        // 🧠 Jika hanya update target kalori (manual)
        if (target_kalori && !usia && !berat && !tinggi && !jenis_kelamin) {
            await db.query(
                `UPDATE users SET target_kalori = ? WHERE id_user = ?`, [target_kalori, id_user]
            );
            return Response.json({ message: "Target kalori berhasil diperbarui" });
        }

        // 🧠 Jika update semua profil
        await db.query(
            `UPDATE users 
       SET usia = ?, berat = ?, tinggi = ?, jenis_kelamin = ?, target_kalori = ?
       WHERE id_user = ?`, [usia, berat, tinggi, jenis_kelamin, target_kalori, id_user]
        );

        return Response.json({ message: "Profil berhasil diperbarui" });
    } catch (error) {
        console.error("Error PUT /api/bmi:", error);
        return Response.json({ error: "Gagal memperbarui profil" }, { status: 500 });
    }
}