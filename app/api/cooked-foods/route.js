// app/api/cooked-foods/route.js
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function GET () {
  try {
    // path absolut ke file di server, sesuai yang kamu bilang:
    // D:\app\app\data\food_recommendations_cooked_only.json
    // dalam konteks Next.js:
    const filePath = path.join(
      process.cwd(),
      'app',
      'data',
      'food_recommendations_cooked_only.json'
    )

    const raw = await fs.readFile(filePath, 'utf-8')
    const json = JSON.parse(raw)

    return NextResponse.json(json)
  } catch (err) {
    console.error('Error reading cooked foods JSON:', err)
    return NextResponse.json(
      { message: 'Gagal membaca file cooked foods', error: err.message },
      { status: 500 }
    )
  }
}
