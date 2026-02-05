import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET (req) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')

    if (!userId && !email) {
      return NextResponse.json(
        {
          message:
            'userId atau email wajib dikirim di query (?userId=... atau ?email=...)'
        },
        { status: 400 }
      )
    }

    // 1. Ambil user & target kalori
    let userRows
    if (userId) {
      ;[userRows] = await db.query(
        'SELECT id_user, target_kalori FROM users WHERE id_user = ?',
        [userId]
      )
    } else {
      ;[userRows] = await db.query(
        'SELECT id_user, target_kalori FROM users WHERE email = ?',
        [email]
      )
    }

    if (userRows.length === 0) {
      return NextResponse.json(
        { message: 'User tidak ditemukan' },
        { status: 404 }
      )
    }

    const { id_user, target_kalori } = userRows[0]

    // 2. Ambil tracking hari ini
    const [trackingRows] = await db.query(
      `
      SELECT kalori_dikonsumsi, kalori_dibakar
      FROM tb_tracking
      WHERE id_user = ? AND tanggal = CURDATE()
      ORDER BY id_tracking DESC
      LIMIT 1
      `,
      [id_user]
    )

    let kaloriDikonsumsi = 0
    let kaloriDibakar = 0

    if (trackingRows.length > 0) {
      kaloriDikonsumsi = trackingRows[0].kalori_dikonsumsi || 0
      kaloriDibakar = trackingRows[0].kalori_dibakar || 0
    }

    const targetKalori = target_kalori || 0
    const netKalori = kaloriDikonsumsi - kaloriDibakar
    const sisaKalori = Math.max(targetKalori - netKalori, 0)

    return NextResponse.json({
      id_user,
      targetKalori,
      kaloriDikonsumsi,
      kaloriDibakar,
      netKalori,
      sisaKalori
    })
  } catch (err) {
    console.error('Error /api/tracking/sisa-kalori', err)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
