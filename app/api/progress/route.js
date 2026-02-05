// app/api/progress/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

/**
 * API: GET /api/progress?id_user=...&range=week|month|all
 *      POST /api/progress
 *
 * Notes:
 * - tanggal in DB is stored as DATE (YYYY-MM-DD) — endpoints assume that.
 * - POST body: { id_user, tanggal (YYYY-MM-DD), type, calories, amount, berat_badan, durasi_workout, detail }
 */

function getStartDateForRange(range) {
    const today = new Date();
    if (range === "week") {
        const d = new Date();
        d.setDate(today.getDate() - 7);
        return d.toISOString().split("T")[0];
    }
    if (range === "month") {
        const d = new Date();
        d.setMonth(today.getMonth() - 1);
        return d.toISOString().split("T")[0];
    }
    return "1970-01-01";
}

export async function GET(req) {
    try {
        const url = new URL(req.url);
        const id_user = url.searchParams.get("id_user");
        const range = url.searchParams.get("range") || "week";

        if (!id_user) {
            return NextResponse.json({ success: false, message: "id_user required" }, { status: 400 });
        }

        // Build query depending on range
        let query = "";
        let params = [];

        if (range === "all") {
            // Ambil semua data user tanpa filter tanggal
            query = "SELECT * FROM tb_tracking WHERE id_user = ? ORDER BY tanggal DESC, created_at DESC";
            params = [Number(id_user)];
        } else {
            const startDate = getStartDateForRange(range);
            query = "SELECT * FROM tb_tracking WHERE id_user = ? AND tanggal >= ? ORDER BY tanggal DESC, created_at DESC";
            params = [Number(id_user), startDate];
        }

        const [rows] = await db.execute(query, params);

        return NextResponse.json({ success: true, data: rows });
    } catch (err) {
        console.error("GET /api/progress error:", err);
        return NextResponse.json({ success: false, message: "Server error", error: String(err) }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();

        const id_user = Number(body.id_user || 0);
        const tanggal = String(body.tanggal || "").trim(); // expect YYYY-MM-DD
        const type = String(body.type || "");
        const calories = Number(body.calories || 0);
        const amount = Number(body.amount || 0);
        const berat_badan = Number(body.berat_badan || 0);
        const durasi_workout = Number(body.durasi_workout || 0);
        const detail = body.detail ? JSON.stringify(body.detail) : null;

        if (!id_user || !tanggal || !type) {
            return NextResponse.json({ success: false, message: "Missing fields (id_user, tanggal, type)" }, { status: 400 });
        }

        // find existing record for user + tanggal (single row per date in this schema)
        const [existing] = await db.execute("SELECT * FROM tb_tracking WHERE id_user = ? AND tanggal = ?", [id_user, tanggal]);

        if (!existing || existing.length === 0) {
            // insert new
            let konsumsi = 0;
            let dibakar = 0;
            let air = 0;
            let detail_makanan = null;
            let detail_aktivitas = null;

            if (type === "meal" || type === "meal_logged") {
                konsumsi = calories;
                detail_makanan = detail;
            } else if (type === "workout" || type === "workout_completed") {
                dibakar = calories;
                detail_aktivitas = detail;
            } else if (type === "water" || type === "water_intake") {
                air = amount;
            } else if (type === "weight_measured") {
                detail_aktivitas = JSON.stringify({ type: "weight", weight: berat_badan, time: new Date().toISOString() });
            }

            const [ins] = await db.execute(
                `INSERT INTO tb_tracking
         (id_user, tanggal, kalori_dikonsumsi, kalori_dibakar, air, protein, karbohidrat, lemak, detail_makanan, detail_aktivitas)
         VALUES (?, ?, ?, ?, ?, 0, 0, 0, ?, ?)`, [id_user, tanggal, konsumsi, dibakar, air, detail_makanan, detail_aktivitas]
            );

            return NextResponse.json({ success: true, insertedId: ins.insertId });
        }

        // update existing -> append values and details
        const row = existing[0];

        let new_konsumsi = Number(row.kalori_dikonsumsi || 0);
        let new_dibakar = Number(row.kalori_dibakar || 0);
        let new_air = Number(row.air || 0);

        let makanan = [];
        let aktivitas = [];

        if (row.detail_makanan) {
            try { makanan = JSON.parse(row.detail_makanan); if (!Array.isArray(makanan)) makanan = [makanan]; } catch { makanan = []; }
        }
        if (row.detail_aktivitas) {
            try { aktivitas = JSON.parse(row.detail_aktivitas); if (!Array.isArray(aktivitas)) aktivitas = [aktivitas]; } catch { aktivitas = []; }
        }

        if (type === "meal" || type === "meal_logged") {
            new_konsumsi += calories;
            if (detail) {
                try {
                    const d = JSON.parse(detail);
                    if (Array.isArray(d)) makanan.push(...d);
                    else makanan.push(d);
                } catch {
                    makanan.push(detail);
                }
            }
        }

        if (type === "workout" || type === "workout_completed") {
            new_dibakar += calories;
            if (detail) {
                try {
                    const d = JSON.parse(detail);
                    if (Array.isArray(d)) aktivitas.push(...d);
                    else aktivitas.push(d);
                } catch {
                    aktivitas.push(detail);
                }
            }
        }

        if (type === "water" || type === "water_intake") {
            new_air += amount;
        }

        if (type === "weight_measured") {
            aktivitas.push({ type: "weight", weight: berat_badan, time: new Date().toISOString() });
        }

        await db.execute(
            `UPDATE tb_tracking SET
         kalori_dikonsumsi = ?,
         kalori_dibakar = ?,
         air = ?,
         detail_makanan = ?,
         detail_aktivitas = ?,
         updated_at = CURRENT_TIMESTAMP
       WHERE id_tracking = ?`, [
                new_konsumsi,
                new_dibakar,
                new_air,
                makanan.length ? JSON.stringify(makanan) : null,
                aktivitas.length ? JSON.stringify(aktivitas) : null,
                row.id_tracking,
            ]
        );

        return NextResponse.json({ success: true, updated: true });
    } catch (err) {
        console.error("POST /api/progress error:", err);
        return NextResponse.json({ success: false, message: "Server error", error: String(err) }, { status: 500 });
    }
}