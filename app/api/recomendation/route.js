import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mysql from "mysql2/promise";

/* =======================
   DB POOL
======================= */
var dbPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "simplefit",
    waitForConnections: true,
    connectionLimit: 10
});

/* =======================
   UTILS
======================= */
function toNumber(v) {
    var n = Number(v);
    return isNaN(n) ? 0 : n;
}

function normalizeMeal(meal) {
    if (meal === "sarapan") return "breakfast";
    if (meal === "makan_siang") return "lunch";
    if (meal === "makan_malam") return "dinner";
    if (meal === "camilan") return "snack";
    return meal;
}

function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
    }
}

function pickRandomTop(list, topN) {
    if (list.length === 0) return null;
    var slice = list.slice(0, Math.min(topN, list.length));
    return slice[Math.floor(Math.random() * slice.length)];
}

/* =======================
   LOAD FOOD DATA
======================= */
async function loadFoods() {
    var fp = path.join(
        process.cwd(),
        "app",
        "data",
        "food_recommendations_with_recipes.json"
    );
    var raw = await fs.readFile(fp, "utf-8");
    return JSON.parse(raw);
}

/* =======================
   MAIN HANDLER
======================= */
function buildReasons(food, sisaKalori) {
    const reasons = [];

    if (food.protein >= 25) {
        reasons.push("Protein tinggi");
    }

    if (food.fat <= 8) {
        reasons.push("Lemak relatif rendah");
    }

    if (food.carbs <= 10) {
        reasons.push("Karbohidrat rendah");
    }

    if (
        food.cooked_reason &&
        (food.cooked_reason.includes("kukus") ||
            food.cooked_reason.includes("rebus"))
    ) {
        reasons.push("Metode masak lebih sehat");
    }

    if (food.kalori <= sisaKalori * 0.4) {
        reasons.push("Cocok dengan sisa kalori hari ini");
    }

    return reasons;
}


function scoreFood(food, goal) {
    if (goal === "fat_loss") {
        return food.protein * 2 - food.fat * 1.5 - food.carbs;
    }

    if (goal === "muscle_gain") {
        return food.protein * 3 + food.kalori * 0.3;
    }

    return food.kalori;
}


export async function POST(req) {
    try {
        var body = await req.json();

        var meal = normalizeMeal(body.meal);
        var usedFoodIds = body.usedFoodIds || [];
        var sisaKalori = toNumber(body.sisaKalori);

        // ✅ AMBIL SEKALI SAJA
        var goal = body.goal || "maintenance";
        var preferences = body.preferences || {};

        // ✅ WAJIB ADA
        var eatenFoodNames = [];


        /* ===== TRACKING HARI INI ===== */
        if (body.userId) {
            var rows = await dbPool.query(
                "SELECT makanan FROM tb_tracking WHERE id_user=? AND DATE(tanggal)=CURDATE()", [body.userId]
            );
            for (var i = 0; i < rows[0].length; i++) {
                eatenFoodNames.push(String(rows[0][i].makanan).toLowerCase());
            }
        }

        /* ===== LOAD FOOD ===== */
        var foods = await loadFoods();
        var pool = [];

        for (var i = 0; i < foods.length; i++) {
            var f = foods[i];
            var id = f.id || i;
            // ===== PERSONALISASI FILTER =====
            if (
                preferences.avoidFried &&
                f.cooked_reason &&
                f.cooked_reason.includes("goreng")
            ) {
                continue;
            }

            if (
                preferences.highProtein &&
                f.protein < 15
            ) {
                continue;
            }

            var name = String(f.name).toLowerCase();
            var cal = toNumber(
                f.kalori !== undefined && f.kalori !== null ?
                f.kalori :
                f.calories
            );

            if (f.meal_primary !== meal) continue;
            if (usedFoodIds.indexOf(id) !== -1) continue;
            if (eatenFoodNames.indexOf(name) !== -1) continue;
            if (cal <= 0 || cal > sisaKalori) continue;

            pool.push({...f, id, kalori: cal });
        }

        // ===============================
        // STEP 6: GOAL-BASED SORTING
        // ===============================
        pool.sort(function(a, b) {
            return scoreFood(b, goal) - scoreFood(a, goal);
        });

        if (pool.length === 0) {
            return NextResponse.json({ recommendations: [], totalCalories: 0 });
        }


        /* ===== GROUP ===== */
        var mains = pool.filter(p => p.type === "main");
        var sides = pool.filter(p => p.type === "side");
        var snacks = pool.filter(p => p.type === "snack");

        /* ===== SORT DESC (TAPI TIDAK FIX) ===== */
        mains.sort((a, b) => b.kalori - a.kalori);
        sides.sort((a, b) => b.kalori - a.kalori);
        snacks.sort((a, b) => b.kalori - a.kalori);

        var result = [];
        var total = 0;

        /* ===== LUNCH / DINNER ===== */
        if (meal === "lunch" || meal === "dinner") {
            var mainPick = pickRandomTop(mains, 3);
            if (!mainPick) {
                return NextResponse.json({ recommendations: [], totalCalories: 0 });
            }
            result.push({
                ...mainPick,
                kalori: cal,
                reason: buildReasons(mainPick, sisaKalori)
            });

            total += mainPick.kalori;

            shuffle(sides);
            for (var s of sides) {
                if (total + s.kalori <= sisaKalori && result.length < 3) {
                    result.push(s);
                    total += s.kalori;
                }
            }

            shuffle(snacks);
            for (var n of snacks) {
                if (total + n.kalori <= sisaKalori && result.length < 4) {
                    result.push(n);
                    total += n.kalori;
                }
            }
        }

        /* ===== BREAKFAST (PALING VARIATIF) ===== */
        if (meal === "breakfast") {
            var candidates = mains.concat(snacks);
            shuffle(candidates);

            for (var c of candidates) {
                if (total + c.kalori <= sisaKalori) {
                    result.push(c);
                    total += c.kalori;
                }
                if (result.length >= 3) break;
            }
        }

        /* ===== SNACK ===== */
        if (meal === "snack") {
            shuffle(snacks);
            for (var k of snacks) {
                if (total + k.kalori <= sisaKalori) {
                    result.push(k);
                    total += k.kalori;
                }
                if (result.length >= 2) break;
            }
        }

        return NextResponse.json({
            source: "Human Meal Engine (VARIATIVE)",
            recommendations: result,
            totalCalories: total,
            usedFoodIds: result.map(r => r.id)
        });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}