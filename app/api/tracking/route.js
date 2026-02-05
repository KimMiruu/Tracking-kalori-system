import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

function todayISO() {
    return new Date().toISOString().slice(0, 10)
}

/* =====================================================
   HELPER — HITUNG TOTAL DARI MEALS (SOURCE OF TRUTH)
===================================================== */
function recalcFromMeals(meals = []) {
    let totalKalori = 0
    let protein = 0
    let karbohidrat = 0
    let lemak = 0

    for (const meal of meals) {
        for (const food of meal.foods || []) {
            totalKalori += Number(food.calories || 0)
            protein += Number(food.protein || 0)
            karbohidrat += Number(food.carbs || 0)
            lemak += Number(food.fat || 0)
        }
    }

    return { totalKalori, protein, karbohidrat, lemak }
}

function recalcFromExercises(exercises = []) {
    let totalBurn = 0

    for (const ex of exercises) {
        totalBurn += Number(ex.calories || 0)
    }

    return totalBurn
}

/* =====================================================
   HELPER — EVALUASI WARNING TRACKING
===================================================== */
function evaluateWarnings({
    protein = 0,
    karbohidrat = 0,
    lemak = 0,
    targetProtein = 120,
    targetKarbo = 250,
    targetLemak = 65
}) {
    const warnings = []

    if (karbohidrat > targetKarbo) {
        warnings.push({
            type: 'over_carbs',
            level: 'warning',
            message: 'Asupan karbohidrat telah melewati batas harian.'
        })
    }

    if (lemak > targetLemak) {
        warnings.push({
            type: 'over_fat',
            level: 'warning',
            message: 'Asupan lemak telah melewati batas harian.'
        })
    }

    return warnings
}

/* =====================================================
   GET — Ambil tracking hari ini + WARNING
===================================================== */
export async function GET(req) {
    try {
        const url = new URL(req.url)
        const searchParams = url.searchParams

        let id_user = searchParams.get('id_user')
        const email = searchParams.get('email')
        const tanggal = searchParams.get('tanggal') || todayISO()

        // 🔎 pastikan user ada
        if (!id_user && email) {
            const userRes = await db.query(
                'SELECT id_user, target_kalori FROM users WHERE email = ? LIMIT 1', [email]
            )
            if (!userRes[0] || !userRes[0][0]) {
                return NextResponse.json({ error: 'User tidak ditemukan' })
            }
            id_user = userRes[0][0].id_user
        }

        if (!id_user) {
            return NextResponse.json({ error: 'id_user tidak valid' })
        }

        // 🎯 ambil target kalori (WAJIB ADA)
        const userResult = await db.query(
            'SELECT target_kalori FROM users WHERE id_user = ? LIMIT 1', [id_user]
        )

        let target_kalori = 0
        if (userResult[0] && userResult[0][0]) {
            target_kalori = Number(userResult[0][0].target_kalori || 0)
        }

        // 🍽️ ambil tracking hari ini
        const trackingRes = await db.query(
            `SELECT *
       FROM tb_tracking
       WHERE id_user = ?
       AND DATE(tanggal) = ?
       LIMIT 1`, [id_user, tanggal]
        )

        // ❗ KALAU BELUM ADA TRACKING → KIRIM DEFAULT
        if (!trackingRes[0] || trackingRes[0].length === 0) {
            return NextResponse.json({
                id_user,
                tanggal,
                target_kalori,
                kalori_dikonsumsi: 0,
                kalori_dibakar: 0,
                protein: 0,
                karbohidrat: 0,
                lemak: 0,
                detail_makanan: null,
                status: 'ok',
                warnings: []
            })
        }

        const row = trackingRes[0][0]

        return NextResponse.json({
            ...row,
            target_kalori,
            status: 'ok',
            warnings: []
        })
    } catch (err) {
        console.error('GET /api/tracking error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}


/* =====================================================
   POST — UPSERT TRACKING + WARNING (ACK SUPPORTED)
===================================================== */
export async function POST(req) {
    try {
        const body = await req.json()
        const tanggal = body.tanggal || todayISO()

        let id_user = body.id_user || body.userId
        const warningAck = body.warning_ack === true

        if (!id_user && body.email) {
            const [rows] = await db.query(
                'SELECT id_user FROM users WHERE email = ? LIMIT 1', [body.email]
            )
            if (!rows.length) {
                return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
            }
            id_user = rows[0].id_user
        }

        if (!id_user) {
            return NextResponse.json({ error: 'id_user atau email wajib' }, { status: 400 })
        }

        /* =========================
           MODE AIR (TIDAK DIUBAH)
        ========================= */
        if (typeof body.add_air === 'number' || body.reset_air === true) {
            const [rows] = await db.query(
                'SELECT air FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) = ?', [id_user, tanggal]
            )

            const currentAir = rows.length ? Number(rows[0].air) || 0 : 0
            const newAir =
                body.reset_air === true ?
                0 :
                Math.max(0, currentAir + Number(body.add_air || 0))

            if (rows.length) {
                await db.query(
                    'UPDATE tb_tracking SET air = ? WHERE id_user = ? AND DATE(tanggal) = ?', [newAir, id_user, tanggal]
                )
            } else {
                await db.query(
                    'INSERT INTO tb_tracking (id_user, tanggal, air) VALUES (?, ?, ?)', [id_user, tanggal, newAir]
                )
            }

            return NextResponse.json({ todayRow: { air: newAir } })
        }

        /* =========================
           SOURCE OF TRUTH: MEALS
        ========================= */
        const meals = Array.isArray(body.meals) ? body.meals : []

        // ambil data tracking lama (kalau ada)
        const [existing] = await db.query(
            'SELECT kalori_dibakar, detail_aktivitas FROM tb_tracking WHERE id_user = ? AND DATE(tanggal) = ?', [id_user, tanggal]
        )

        let kalori_dibakar = 0
        let exercises = []

        // 🔥 JIKA FRONTEND KIRIM EXERCISES
        if (Array.isArray(body.exercises)) {
            exercises = body.exercises
            kalori_dibakar = recalcFromExercises(exercises)
        }
        // 🔥 JIKA TIDAK KIRIM → PAKAI DATA LAMA
        else if (existing.length) {
            kalori_dibakar = Number(existing[0].kalori_dibakar || 0)

            const rawAktivitas = existing[0].detail_aktivitas

            if (typeof rawAktivitas === 'string' && rawAktivitas.trim() !== '') {
                try {
                    exercises = JSON.parse(rawAktivitas)
                } catch {
                    exercises = []
                }
            } else {
                exercises = []
            }
        }

        const recalced = recalcFromMeals(meals)


        if (existing.length) {
            await db.query(
                `UPDATE tb_tracking SET
          kalori_dikonsumsi = ?,
          kalori_dibakar = ?,
          protein = ?,
          karbohidrat = ?,
          lemak = ?,
          detail_makanan = ?,
          detail_aktivitas = ?
         WHERE id_user = ? AND DATE(tanggal) = ?`, [
                    recalced.totalKalori,
                    kalori_dibakar,
                    recalced.protein,
                    recalced.karbohidrat,
                    recalced.lemak,
                    JSON.stringify(meals),
                    JSON.stringify(exercises),
                    id_user,
                    tanggal
                ]
            )
        } else {
            await db.query(
                `INSERT INTO tb_tracking
         (id_user, tanggal, kalori_dikonsumsi, kalori_dibakar, protein, karbohidrat, lemak, detail_makanan, detail_aktivitas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    id_user,
                    tanggal,
                    recalced.totalKalori,
                    kalori_dibakar,
                    recalced.protein,
                    recalced.karbohidrat,
                    recalced.lemak,
                    JSON.stringify(meals),
                    JSON.stringify(exercises)
                ]
            )
        }

        return NextResponse.json({
            status: 'ok',
            warnings: []
        })

    } catch (err) {
        console.error('POST /api/tracking error:', err)
        return NextResponse.json({ error: 'Gagal menyimpan tracking' }, { status: 500 })
    }
}