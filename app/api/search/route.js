// app/api/fatsecret/search/route.js
import { NextResponse } from "next/server";

let tokenCache = {
    access_token: null,
    expires_at: 0,
};

async function getAccessToken() {
    const now = Date.now();
    if (tokenCache.access_token && tokenCache.expires_at > now + 5000) {
        return tokenCache.access_token;
    }

    const clientId = process.env.FATSECRET_CLIENT_ID;
    const clientSecret = process.env.FATSECRET_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
        throw new Error("FatSecret credentials not set in env.");
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const resp = await fetch("https://oauth.fatsecret.com/connect/token", {
        method: "POST",
        headers: {
            "Authorization": `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials&scope=basic",
    });

    if (!resp.ok) {
        const text = await resp.text();
        throw new Error(`Failed to fetch token: ${resp.status} ${text}`);
    }

    const data = await resp.json();
    const access_token = data.access_token;
    const expires_in = data.expires_in || 3600;
    tokenCache.access_token = access_token;
    tokenCache.expires_at = Date.now() + (expires_in * 1000);

    return access_token;
}

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query") || searchParams.get("q") || "";
        if (!query || query.trim().length === 0) {
            return NextResponse.json({ foods: [] });
        }

        const token = await getAccessToken();

        // call FatSecret foods.search API
        // Use encodeURIComponent for query
        const url = `https://platform.fatsecret.com/rest/server.api?method=foods.search&search_expression=${encodeURIComponent(query)}&format=json`;

        const res = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json",
            },
        });

        if (!res.ok) {
            const t = await res.text();
            return new NextResponse(t, { status: res.status });
        }

        const json = await res.json();
        // Return as-is (frontend will parse)
        return NextResponse.json(json);
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}