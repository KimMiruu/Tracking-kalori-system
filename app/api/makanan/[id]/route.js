import { db } from "@/lib/db";

export async function DELETE(_, { params }) {
    try {
        const { id_makanan } = params;
        await db.query("DELETE FROM tb_makanan WHERE id_makanan = ?", [id_makanan]);
        return Response.json({ message: "Makanan berhasil dihapus" });
    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}