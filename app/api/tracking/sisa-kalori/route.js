import { NextResponse } from 'next/server'
import db from '@/lib/db'

function todayISO() {
    return new Date().toISOString().slice(0, 10)
}

/* =====================================================
   GET — HITUNG SISA KALORI (FIX TOTAL)
===================================================== */
export async function GET(req) {
    try {
        const url = new URL(req.url)
        const searchParams = url.searchParams

        const userId = searchParams.get('userId')
        const email = searchParams.get('email')

        if (!userId && !email) {
            return NextResponse.json({ message: 'userId atau email wajib dikirim' }, { status: 400 })
        }

        /* =========================
           1️⃣ Ambil data user
        ========================= */
        let userResult
        if (userId) {
            userResult = await db.query(
                'SELECT id_user, target_kalori FROM users WHERE id_user = ? LIMIT 1', [userId]
            )
        } else {
            userResult = await db.query(
                'SELECT id_user, target_kalori FROM users WHERE email = ? LIMIT 1', [email]
            )
        }

        const userRows = userResult[0]
        if (!userRows || userRows.length === 0) {
            return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })
        }

        const id_user = userRows[0].id_user
        const targetKalori = Number(userRows[0].target_kalori) || 0
        const today = todayISO()

        /* =========================
           2️⃣ Ambil tracking hari ini
           🔥 FIX: ambil detail_makanan
        ========================= */
        const trackingResult = await db.query(
            `SELECT detail_makanan, kalori_dibakar
       FROM tb_tracking
       WHERE id_user = ?
       AND DATE(tanggal) = ?
       LIMIT 1`, [id_user, today]
        )

        let kaloriDikonsumsi = 0
        let kaloriDibakar = 0

        if (trackingResult[0] && trackingResult[0].length > 0) {
            const row = trackingResult[0][0]

            kaloriDibakar = Number(row.kalori_dibakar) || 0

            if (row.detail_makanan) {
                try {
                    const meals = JSON.parse(row.detail_makanan)

                    for (const meal of meals || []) {
                        for (const food of meal.foods || []) {
                            kaloriDikonsumsi += Number(food.calories || 0)
                        }
                    }
                } catch (e) {
                    console.error('detail_makanan JSON invalid:', e)
                }
            }
        }

        /* =========================
           3️⃣ Hitung sisa kalori
        ========================= */
        const netKalori = kaloriDikonsumsi - kaloriDibakar
        let sisaKalori = targetKalori - netKalori
        if (sisaKalori < 0) sisaKalori = 0

        return NextResponse.json({
            id_user,
            targetKalori,
            kaloriDikonsumsi,
            kaloriDibakar,
            netKalori,
            sisaKalori,
            tanggal: today
        })
    } catch (err) {
        console.error('GET /api/tracking/sisa-kalori error:', err)
        return NextResponse.json({ message: 'Terjadi kesalahan server' }, { status: 500 })
    }
}