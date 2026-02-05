// @ts-nocheck
import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET(req) {
    let db;
    try {
        const url = new URL(req.url);
        const id_user = url.searchParams.get("id_user");

        if (!id_user) {
            return NextResponse.json({ success: false, message: "id_user diperlukan" }, { status: 400 });
        }

        db = await mysql.createConnection({
            host: "localhost",
            user: "root",
            password: "",
            database: "simplefit_db",
        });

        // Ambil user
        const [userRows] = await db.execute(
            "SELECT id_user, username, email FROM users WHERE id_user = ? LIMIT 1", [id_user]
        );

        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ success: false, message: "User tidak ditemukan" }, { status: 404 });
        }
        const user = userRows[0];

        // Tanggal hari ini dalam format YYYY-MM-DD
        const today = new Date().toISOString().split("T")[0];

        // Ambil tracking hari ini (jika ada)
        const [trackRows] = await db.execute(
            "SELECT * FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) = ? LIMIT 1", [id_user, today]
        );
        const t = (trackRows && trackRows.length > 0) ? trackRows[0] : {};

        // Parse detail JSON bila ada
        let detail_makanan = [];
        let detail_aktivitas = [];
        try {
            if (t.detail_makanan) {
                detail_makanan = JSON.parse(t.detail_makanan);
            }
        } catch (e) {
            // ignore parse error
        }
        try {
            if (t.detail_aktivitas) {
                detail_aktivitas = JSON.parse(t.detail_aktivitas);
            }
        } catch (e) {
            // ignore parse error
        }

        // Ambil recentActivities: hanya dari hari ini (flat jika detail_aktivitas disimpan sebagai JSON array)
        const [recentRows] = await db.execute(
            "SELECT detail_aktivitas, tanggal FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) = CURDATE() ORDER BY tanggal DESC LIMIT 5", [id_user]
        );

        let recentActivities = [];
        if (recentRows && recentRows.length > 0) {
            const mapped = recentRows.map(function(r) {
                try {
                    return r.detail_aktivitas ? JSON.parse(r.detail_aktivitas) : [];
                } catch (e) {
                    return [];
                }
            });
            // flatten one level
            for (let arr of mapped) {
                if (Array.isArray(arr)) {
                    recentActivities = recentActivities.concat(arr);
                } else {
                    recentActivities.push(arr);
                }
            }
        }

        // Hitung streak sederhana (cek entry berturut-turut sampai terputus)
        const [allRows] = await db.execute(
            "SELECT tanggal FROM tb_tracking WHERE id_user = ? ORDER BY tanggal DESC", [id_user]
        );

        let streak = 0;
        let cursor = new Date(today);
        if (allRows && allRows.length > 0) {
            for (let row of allRows) {
                const d = new Date(row.tanggal);
                if (d.toDateString() === cursor.toDateString()) {
                    streak++;
                    cursor.setDate(cursor.getDate() - 1);
                } else {
                    break;
                }
            }
        }

        // Hitung activeDays & consistency dalam 7 hari terakhir (inklusive hari ini)
        const periodDays = 7;
        const [activeRows] = await db.execute(
            "SELECT COUNT(DISTINCT DATE(tanggal)) AS activeDays FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)", [id_user]
        );

        let activeDays = 0;
        if (activeRows && activeRows.length > 0 && activeRows[0].activeDays) {
            activeDays = Number(activeRows[0].activeDays);
        } else {
            activeDays = 0;
        }
        const consistency = Math.round((activeDays / periodDays) * 100);

        // Total kalori selama periode 7 hari
        const [calRows] = await db.execute(
            "SELECT COALESCE(SUM(kalori_dikonsumsi),0) AS konsumsi, COALESCE(SUM(kalori_dibakar),0) AS dibakar FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)", [id_user]
        );

        let konsumsi = 0;
        let dibakar = 0;
        if (calRows && calRows.length > 0) {
            if (calRows[0].konsumsi) {
                konsumsi = Number(calRows[0].konsumsi);
            } else {
                konsumsi = 0;
            }
            if (calRows[0].dibakar) {
                dibakar = Number(calRows[0].dibakar);
            } else {
                dibakar = 0;
            }
        }
        const caloriesPeriod = konsumsi + dibakar;
        const improving = activeDays >= Math.ceil(periodDays / 2);

        // Susun response
        return NextResponse.json({
            success: true,
            user: user,
            streak: streak,
            tracking: {
                kalori_dikonsumsi: t.kalori_dikonsumsi ? t.kalori_dikonsumsi : 0,
                kalori_dibakar: t.kalori_dibakar ? t.kalori_dibakar : 0,
                air: t.air ? t.air : 0,
                protein: t.protein ? t.protein : 0,
                karbohidrat: t.karbohidrat ? t.karbohidrat : 0,
                lemak: t.lemak ? t.lemak : 0,
                tanggal: t.tanggal ? t.tanggal : today,
                detail_makanan: detail_makanan,
                detail_aktivitas: detail_aktivitas,
            },
            recentActivities: recentActivities,
            progressSummary: {
                activeDays: activeDays,
                consistency: consistency,
                improving: improving,
                totalDays: periodDays,
                caloriesPeriod: caloriesPeriod,
            },
        });
    } catch (err) {
        console.error("API /api/dashboard error:", err && err.message ? err.message : err);
        return NextResponse.json({ success: false, message: String(err) }, { status: 500 });
    } finally {
        try {
            if (db && db.end) {
                await db.end();
            }
        } catch (e) {
            // ignore
        }
    }
}