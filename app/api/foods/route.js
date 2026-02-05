import { NextResponse } from "next/server";

const FATSECRET_CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const FATSECRET_CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
    const now = Date.now();
    if (cachedToken && now < tokenExpiry) return cachedToken;

    console.log("🔑 Fetching new FatSecret token...");
    const res = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            Authorization: "Basic " +
                Buffer.from(`${FATSECRET_CLIENT_ID}:${FATSECRET_CLIENT_SECRET}`).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=basic",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error("❌ TOKEN ERROR RESPONSE:", text);
        throw new Error("Gagal mengambil token FatSecret");
    }

    const data = await res.json();
    console.log("✅ Token berhasil diambil:", data);
    cachedToken = data.access_token;
    tokenExpiry = now + data.expires_in * 1000;
    return cachedToken;
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || "healthy food";

        console.log("🔍 Query:", query);

        const token = await getAccessToken();

        const res = await fetch(
            `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(
        query
      )}&format=json`, {
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            const text = await res.text();
            console.error("❌ FatSecret API Error Response:", text);
            throw new Error("Gagal mengambil data makanan dari FatSecret");
        }

        const data = await res.json();
        console.log("✅ Data makanan berhasil diambil:", data);
        return NextResponse.json(data);
    } catch (err) {
        console.error("⚠️ FatSecret API Error:", err.message);
        return NextResponse.json({ message: err.message }, { status: 500 });
    }
}