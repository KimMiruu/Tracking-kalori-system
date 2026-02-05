import { db } from "@/lib/db";

export async function GET() {
    try {
        const [rows] = await db.query("SELECT * FROM tb_makanan ORDER BY id_makanan DESC");
        return Response.json(rows);
    } catch (error) {
        console.error("GET Error:", error);
        return new Response("Gagal mengambil data makanan", { status: 500 });
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const { nama, kategori, karbo, protein, lemak, kalori, air } = body;

        // Validasi kategori
        const validCategories = ["sarapan", "makan_siang", "makan_malam", "camilan"];
        const finalKategori = validCategories.includes(kategori) ? kategori : "camilan";

        // Hitung kalori otomatis jika tidak disediakan
        const finalKalori = kalori || protein * 4 + karbo * 4 + lemak * 9;

        await db.query("INSERT INTO tb_makanan (nama, kategori, karbo, protein, lemak, kalori, air) VALUES (?, ?, ?, ?, ?, ?, ?)", [nama, finalKategori, karbo, protein, lemak, finalKalori, air || 0]);

        return Response.json({ message: "Makanan berhasil ditambahkan" });
    } catch (error) {
        console.error("POST Error:", error);
        return new Response("Gagal menambahkan makanan", { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { id_makanan } = await req.json();
        await db.query("DELETE FROM tb_makanan WHERE id_makanan = ?", [id_makanan]);
        return Response.json({ message: "Makanan berhasil dihapus" });
    } catch (error) {
        console.error("DELETE Error:", error);
        return new Response("Gagal menghapus makanan", { status: 500 });
    }
}

// Endpoint tambahan untuk mendapatkan makanan berdasarkan kategori
export async function GET_BY_CATEGORY(req) {
    try {
        const url = new URL(req.url);
        const kategori = url.searchParams.get("kategori");

        const validCategories = ["sarapan", "makan_siang", "makan_malam", "camilan"];

        if (kategori && validCategories.includes(kategori)) {
            const [rows] = await db.query("SELECT * FROM tb_makanan WHERE kategori = ? ORDER BY nama", [kategori]);
            return Response.json(rows);
        } else {
            const [rows] = await db.query("SELECT * FROM tb_makanan ORDER BY kategori, nama");
            return Response.json(rows);
        }
    } catch (error) {
        console.error("GET_BY_CATEGORY Error:", error);
        return new Response("Gagal mengambil data makanan", { status: 500 });
    }
}