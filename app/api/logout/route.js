import { NextResponse } from "next/server";

export async function POST() {
    try {
        const res = NextResponse.json({ message: "Logout berhasil" });
        res.cookies.set("token", "", {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            expires: new Date(0),
            path: "/",
        });
        return res;
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json({ error: "Gagal logout" }, { status: 500 });
    }
}