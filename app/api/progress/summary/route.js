// app/api/progress/summary/route.js
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

function getStartDate(range) {
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
            query = "SELECT * FROM tb_tracking WHERE id_user = ? ORDER BY tanggal DESC, created_at DESC";
            params = [Number(id_user)];
        } else {
            const startDate = getStartDate(range);
            query = "SELECT * FROM tb_tracking WHERE id_user = ? AND tanggal >= ? ORDER BY tanggal DESC, created_at DESC";
            params = [Number(id_user), startDate];
        }

        const [trackRows] = await db.execute(query, params);

        // fetch user — only columns that exist in user's table (avoid unknown columns)
        const [userRows] = await db.execute(
            "SELECT id_user, username, email, berat, tinggi, target_kalori FROM users WHERE id_user = ?", [Number(id_user)]
        );
        const user = userRows && userRows.length ? userRows[0] : null;

        // compute simple summary
        let totalCaloriesConsumed = 0;
        let totalCaloriesBurned = 0;
        let totalWorkouts = 0;
        let waterDays = 0;

        for (const r of trackRows) {
            totalCaloriesConsumed += Number(r.kalori_dikonsumsi || 0);
            totalCaloriesBurned += Number(r.kalori_dibakar || 0);
            if (Number(r.kalori_dibakar || 0) > 0) totalWorkouts += 1;
            if (Number(r.air || 0) >= 2000) waterDays += 1;
        }

        // --- consistency calculation (server-side)
        // unique active days in the selected range
        const uniqueDates = new Set();
        for (const r of trackRows) {
            // prefer tanggal (DATE) else created_at
            const key = (r.tanggal || (r.created_at ? String(r.created_at).slice(0, 10) : null));
            if (key) uniqueDates.add(String(key));
        }

        // days in the period (week=7, month=30, all => last 30 days window by default)
        let daysInRange = 30;
        if (range === "week") daysInRange = 7;
        else if (range === "month") daysInRange = 30;
        else if (range === "all") {
            // for 'all' we take span between earliest relevant date and now (capped min 1)
            if (trackRows.length > 0) {
                const dates = trackRows.map(r => new Date(r.tanggal || r.created_at));
                const minD = new Date(Math.min(...dates.map(d => d.getTime())));
                const maxD = new Date(Math.max(...dates.map(d => d.getTime())));
                const diffDays = Math.max(1, Math.ceil((maxD - minD) / (1000 * 60 * 60 * 24)));
                daysInRange = Math.max(diffDays, 30); // at least 30 days window
            } else daysInRange = 30;
        }

        const activeDays = uniqueDates.size;
        const consistencyPct = Math.round((activeDays / Math.max(1, daysInRange)) * 100);

        return NextResponse.json({
            success: true,
            data: {
                user,
                totalCaloriesConsumed,
                totalCaloriesBurned,
                totalWorkouts,
                waterDays,
                daysTracked: trackRows.length,
                activeDays,
                daysInRange,
                consistencyPct
            },
        });
    } catch (err) {
        console.error("GET /api/progress/summary error:", err);
        return NextResponse.json({ success: false, message: "Server error", error: String(err) }, { status: 500 });
    }
}