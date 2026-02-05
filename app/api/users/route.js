import mysql from "mysql2/promise";

export async function GET() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "", // isi password MySQL kamu kalau ada
      database: "simplefit_db",
      port: 3306, // tambahkan port di sini
    });

    const [rows] = await db.execute("SELECT * FROM users");
    await db.end();

    return new Response(JSON.stringify(rows), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
