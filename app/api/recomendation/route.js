import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import mysql from "mysql2/promise";

/**
 * =========================================================
 * HYBRID FOOD RECOMMENDATION SYSTEM (GBDT + RULE + GREEDY)
 * =========================================================
 *
 * 🎯 TUJUAN SISTEM:
 * Sistem ini dirancang untuk memberikan rekomendasi makanan
 * yang:
 *  - sesuai kebutuhan kalori user
 *  - sesuai GOAL user (naik otot / jaga berat / turun berat) <-- BARU
 *  - tidak repetitif
 *  - personal (berbasis ML)
 *  - tetap bervariasi (diversity control)
 *
 * 🧠 ARSITEKTUR:
 * 1. GBDT (Machine Learning Layer)
 *    -> Ranking makanan berdasarkan model CatBoost/GBDT
 *
 * 2. Rule-Based Filtering
 *    -> Filter meal type + history user + validasi input
 *
 * 3. Macro Fit Scoring (RULE-BASED)            <-- BARU
 *    -> Menilai seberapa cocok komposisi gizi makanan
 *       dengan goal user (protein/fat/carbs ratio)
 *
 * 4. Hybrid Ranking + Greedy Knapsack
 *    -> Gabungkan skor ML + skor macro fit, lalu seleksi
 *       berdasarkan sisa kalori
 *
 * 5. Diversity Control Layer
 *    -> Mencegah rekomendasi monoton / item yang sama terus muncul
 *       (tie-break shuffle, bukan random total)
 */

/**
 * =========================================================
 * DATABASE CONNECTION POOL
 * =========================================================
 */
const dbPool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "simplefit",
    waitForConnections: true,
    connectionLimit: 10,
});

/**
 * =========================================================
 * ML ENDPOINT (GBDT MODEL SERVICE)
 * =========================================================
 */
const ML_API = process.env.ML_API_URL || "http://localhost:8000";

/**
 * =========================================================
 * GOAL -> MACRO RULE DEFAULT
 * =========================================================
 *
 * Rule ini dipakai untuk MENILAI (scoring), bukan untuk hard-filter.
 * Jadi makanan yang kurang sesuai tidak langsung dibuang,
 * hanya diberi skor lebih rendah -> tetap ada variasi (diversity tetap jalan).
 *
 * Cara baca:
 * - weight.protein / weight.fat / weight.carbs adalah bobot kepentingan
 *   tiap macro untuk goal tsb (total tidak harus 1, ini bobot relatif)
 * - direction "high" artinya semakin tinggi rasio macro tsb semakin bagus
 * - direction "low"  artinya semakin RENDAH rasio macro tsb semakin bagus
 *
 * Rasio yang dipakai untuk scoring = gram_macro / kalori_makanan
 * (gram per kalori), BUKAN gram mentah. Ini supaya makanan dengan
 * porsi/kalori besar tidak otomatis menang dibanding makanan kecil
 * yang sebenarnya lebih padat gizi.
 */
const GOAL_MACRO_RULES = {
    naik_otot: {
        protein: { weight: 0.6, direction: "high" },
        fat: { weight: 0.15, direction: "low" },
        carbs: { weight: 0.25, direction: "high" },
    },
    jaga_berat: {
        protein: { weight: 0.34, direction: "high" },
        fat: { weight: 0.33, direction: "low" },
        carbs: { weight: 0.33, direction: "high" },
    },
    turun_berat: {
        protein: { weight: 0.45, direction: "high" }, // tetap tinggi: jaga massa otot saat defisit
        fat: { weight: 0.4, direction: "low" }, // paling diprioritaskan rendah
        carbs: { weight: 0.15, direction: "high" },
    },
};

/**
 * Estimasi rasio "ideal" per gram-kalori, dipakai sebagai acuan normalisasi.
 * Angka ini hasil observasi umum makanan sehat (boleh disesuaikan nanti
 * berdasarkan data real dataset food_recommendations_with_recipes.json).
 *
 * - protein: ~0.10 g per kalori dianggap sudah tinggi (mis. dada ayam ~0.12-0.15)
 * - fat:     ~0.06 g per kalori dianggap sudah tinggi/berlemak
 * - carbs:   ~0.20 g per kalori dianggap sudah tinggi karbo
 */
const MACRO_RATIO_REFERENCE = {
    protein: 0.10,
    fat: 0.06,
    carbs: 0.20,
};

/**
 * =========================================================
 * UTILITY FUNCTIONS
 * =========================================================
 */

function toNumber(v) {
    var n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function normalizeStrict(name) {
    return String(name)
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .trim();
}

function normalizeMeal(meal) {
    var map = {
        sarapan: "breakfast",
        makan_siang: "lunch",
        makan_malam: "dinner",
        camilan: "snack",
    };
    return map[meal] || meal;
}

/**
 * Normalisasi input goal user ke key internal GOAL_MACRO_RULES.
 * Menerima beberapa alias umum supaya lebih toleran terhadap input FE.
 */
function normalizeGoal(goal) {
    var map = {
        bulking: "naik_otot",
        muscle_gain: "naik_otot",
        naik_otot: "naik_otot",
        gain_muscle: "naik_otot",

        maintain: "jaga_berat",
        jaga_berat: "jaga_berat",
        maintenance: "jaga_berat",

        cutting: "turun_berat",
        fat_loss: "turun_berat",
        turun_berat: "turun_berat",
        weight_loss: "turun_berat",
    };
    return map[goal] || "jaga_berat"; // default aman: jaga_berat (seimbang)
}

function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    }
    return a;
}

async function loadFoods() {
    var fp = path.join(
        process.cwd(),
        "app",
        "data",
        "food_recommendations_with_recipes.json"
    );

    return JSON.parse(await fs.readFile(fp, "utf-8"));
}

/**
 * =========================================================
 * MACRO FIT SCORING MODULE (BARU)
 * =========================================================
 *
 * Menghasilkan skor 0-100 yang merepresentasikan seberapa
 * cocok komposisi gizi sebuah makanan dengan goal user.
 */

/**
 * Hitung skor satu macro (protein/fat/carbs) terhadap arah
 * yang diinginkan ("high" atau "low"), dinormalisasi 0-100.
 */
function scoreSingleMacro(ratio, reference, direction) {
    if (reference <= 0) return 50; // fallback netral

    // rasio relatif terhadap acuan, di-cap supaya tidak meledak
    var relative = ratio / reference;
    if (relative > 2) relative = 2; // cap di 2x acuan

    var highScore = (relative / 2) * 100; // 0..100, makin tinggi rasio makin besar
    if (direction === "high") return highScore;

    // direction === "low" -> kebalikannya: rasio rendah = skor tinggi
    return 100 - highScore;
}

/**
 * Skor kecocokan makanan terhadap goal, range 0-100.
 * kalori = 0 dihindari (div by zero) -> return skor netral.
 */
function scoreMacroFit(food, goalKey) {
    var rules = GOAL_MACRO_RULES[goalKey] || GOAL_MACRO_RULES.jaga_berat;
    var kalori = toNumber(food.kalori || food.calories);

    if (kalori <= 0) return 50;

    var proteinRatio = toNumber(food.protein) / kalori;
    var fatRatio = toNumber(food.fat) / kalori;
    var carbsRatio = toNumber(food.carbs) / kalori;

    var proteinScore = scoreSingleMacro(
        proteinRatio,
        MACRO_RATIO_REFERENCE.protein,
        rules.protein.direction
    );
    var fatScore = scoreSingleMacro(
        fatRatio,
        MACRO_RATIO_REFERENCE.fat,
        rules.fat.direction
    );
    var carbsScore = scoreSingleMacro(
        carbsRatio,
        MACRO_RATIO_REFERENCE.carbs,
        rules.carbs.direction
    );

    var totalWeight = rules.protein.weight + rules.fat.weight + rules.carbs.weight;

    var weighted =
        proteinScore * rules.protein.weight +
        fatScore * rules.fat.weight +
        carbsScore * rules.carbs.weight;

    return weighted / totalWeight; // 0-100
}

/**
 * =========================================================
 * USER HISTORY PROCESSING MODULE
 * =========================================================
 */
/**
 * STRUKTUR ASLI (dikonfirmasi langsung dari isi tb_tracking.detail_makanan):
 *
 *   [
 *     {
 *       "mealKey": "sarapan",
 *       "foods": [
 *         { "name": "Ubi jalar ..." },
 *         ...
 *       ]
 *     },
 *     { "mealKey": "makan_siang", "foods": [...] },
 *     ...
 *   ]
 *
 * Tiap elemen array TERLUAR adalah grup per meal (mealKey + foods[]),
 * BUKAN langsung object makanan. Nama makanan ada di dalam
 * `entry.foods[i].name`. Versi sebelumnya salah asumsi struktur flat
 * ([{name: "..."}]) sehingga eatenToday selalu kosong dan makanan
 * yang sudah ditrack tetap muncul lagi di rekomendasi.
 *
 * Fallback flat tetap dipertahankan untuk jaga-jaga data lama.
 */
function parseFoodNames(detailMakanan) {
    var names = new Set();
    if (!detailMakanan) return names;

    try {
        var data =
            typeof detailMakanan === "string" ?
            JSON.parse(detailMakanan) :
            detailMakanan;

        if (!Array.isArray(data)) return names;

        for (var i = 0; i < data.length; i++) {
            var entry = data[i];
            if (!entry) continue;

            // Struktur asli: entry = { mealKey, foods: [{name}, ...] }
            if (Array.isArray(entry.foods)) {
                for (var j = 0; j < entry.foods.length; j++) {
                    var foodItem = entry.foods[j];
                    if (!foodItem) continue;

                    var foodName =
                        foodItem.name ||
                        foodItem.nama ||
                        foodItem.nama_makanan ||
                        "";

                    if (foodName) {
                        names.add(normalizeStrict(foodName));
                    }
                }
                continue;
            }

            // Fallback: struktur flat lama, entry langsung berupa makanan
            var name =
                entry.name ||
                entry.nama ||
                entry.nama_makanan ||
                "";

            if (name) {
                names.add(normalizeStrict(name));
            }
        }
    } catch (e) {
        // silent error handling agar API tetap stabil
    }

    return names;
}

/**
 * Mengambil SEMUA makanan yang PERNAH ditrack user, lintas tanggal
 * (bukan cuma hari ini). Dipakai untuk SOFT-EXCLUDE: makanan yang
 * sudah pernah dimakan diprioritaskan untuk TIDAK muncul lagi,
 * tapi tetap boleh dipakai sebagai fallback kalau pool makanan
 * yang belum pernah dimakan tidak cukup (< jumlah rekomendasi
 * yang dibutuhkan).
 *
 * Beda dengan getEatenToday (hard-exclude, khusus hari ini saja),
 * fungsi ini TIDAK memfilter berdasarkan tanggal sama sekali.
 *
 * Catatan performa: query ini mengambil seluruh history user.
 * Untuk user yang sudah lama pakai aplikasi & punya ribuan baris
 * tracking, pertimbangkan menambah LIMIT pada query (mis. ambil
 * 200 baris tracking terakhir) atau index pada id_user agar tetap
 * cepat.
 */
async function getEatenHistory(userId) {
    var eaten = new Set();
    if (!userId) return eaten;

    try {
        var result = await dbPool.query(
            "SELECT detail_makanan FROM tb_tracking WHERE id_user = ? ORDER BY id_tracking DESC", [userId]
        );

        var rows = result[0];

        for (var i = 0; i < rows.length; i++) {
            var set = parseFoodNames(rows[i].detail_makanan);
            set.forEach((n) => eaten.add(n));
        }
    } catch (e) {
        // fallback jika database gagal
    }

    return eaten;
}

async function getEatenToday(userId) {
    var eaten = new Set();
    if (!userId) return eaten;

    try {
        /**
         * PENTING: tanggal "hari ini" dihitung oleh MySQL sendiri
         * (CURDATE()), BUKAN oleh JavaScript (new Date()).
         *
         * Alasan: new Date().toISOString() selalu UTC, sedangkan
         * server/DB berjalan di WIB (Asia/Jakarta, UTC+7). Kalau
         * dihitung di JS, antara jam 00:00-06:59 WIB sistem ini
         * masih menganggap "hari ini" = kemarin (UTC), sehingga
         * row tracking yang baru saja di-insert hari ini (WIB)
         * tidak ketemu saat query -> makanan yang sudah dimakan
         * tetap muncul lagi di rekomendasi.
         *
         * Dengan CURDATE(), tanggal yang dipakai untuk filter
         * SELALU konsisten dengan timezone session MySQL itu
         * sendiri -> sama persis dengan tanggal yang dipakai
         * saat INSERT tracking (asalkan keduanya pakai koneksi
         * MySQL yang sama / timezone session yang sama).
         */
        var result = await dbPool.query(
            "SELECT detail_makanan FROM tb_tracking WHERE id_user = ? AND tanggal = CURDATE()", [userId]
        );

        var rows = result[0];

        for (var i = 0; i < rows.length; i++) {
            var set = parseFoodNames(rows[i].detail_makanan);
            set.forEach((n) => eaten.add(n));
        }
    } catch (e) {
        // fallback jika database gagal
    }

    return eaten;
}

/**
 * =========================================================
 * MAIN API ENDPOINT (POST)
 * =========================================================
 */
export async function POST(req) {
    try {
        var body = await req.json();

        /**
         * INPUT USER
         */
        var meal = normalizeMeal(body.meal);
        var goal = normalizeGoal(body.goal); // <-- BARU
        var sisaKalori = toNumber(body.sisaKalori);
        var userId = body.userId || null;

        var clientUsedIds = Array.isArray(body.usedFoodIds) ?
            body.usedFoodIds.map((x) => String(x)) : [];

        /**
         * VALIDASI INPUT
         */
        if (sisaKalori <= 0) {
            return NextResponse.json({ recommendations: [] });
        }

        /**
         * =====================================================
         * USER HISTORY (ANTI REPEAT SYSTEM)
         * =====================================================
         * - eatenToday   : HARD-EXCLUDE, makanan yang dimakan HARI INI
         *                  tidak boleh muncul sama sekali (mencegah
         *                  rekomendasi makanan yang sama persis di
         *                  hari yang sama).
         * - eatenHistory : SOFT-EXCLUDE, semua makanan yang PERNAH
         *                  ditrack user kapan pun. Diprioritaskan
         *                  untuk tidak muncul, tapi tetap boleh jadi
         *                  fallback kalau pool makanan baru tidak
         *                  cukup -> supaya endpoint tidak pernah
         *                  return kosong hanya karena user sudah
         *                  sering pakai aplikasi.
         */
        var eatenToday = await getEatenToday(userId);
        var eatenHistory = await getEatenHistory(userId);

        /**
         * =====================================================
         * LOAD FOOD DATASET
         * =====================================================
         */
        var foodsData = await loadFoods();

        var foodByName = new Map();
        for (var i = 0; i < foodsData.length; i++) {
            var f = foodsData[i];
            foodByName.set(normalizeStrict(f.name), f);
        }

        /**
         * =====================================================
         * GBDT PREDICTION LAYER (MACHINE LEARNING)
         * =====================================================
         */
        var mlNames = [];

        try {
            var goalEncMap = { naik_otot: 2, jaga_berat: 0, turun_berat: 1 };
            var goalEnc = goalEncMap[goal] ?? 0;
            var mealEncMap = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
            var mealEnc = mealEncMap[meal] ?? 0;

            var mlRes = await fetch(ML_API + "/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    remaining_calories: sisaKalori,
                    goal_enc: goalEnc,
                    meal_enc: mealEnc,
                    vegetarian: 0,
                    high_protein: 0,
                    top_n: 50,
                }),
            });

            if (mlRes.ok) {
                var mlData = await mlRes.json();
                mlNames = mlData.recommendations || [];
            }
        } catch (e) {}

        // map food_name -> ml rank score (semakin awal di list ML, semakin tinggi)
        var mlScoreMap = new Map();
        for (var i = 0; i < mlNames.length; i++) {
            var key = normalizeStrict(mlNames[i].food_name);
            // skor menurun linear dari 100 -> sesuai posisi di ranking ML
            var mlScore = Math.max(100 - i * (100 / mlNames.length), 0);
            mlScoreMap.set(key, mlScore);
        }

        /**
         * Format standar item rekomendasi.
         * `score` sekarang adalah HYBRID SCORE (ML + macro fit),
         * dikurangi penalti kalau makanan ini pernah ditrack user
         * sebelumnya (everEaten). Penalti besar tapi TIDAK membuang
         * item -> makanan tetap bisa muncul sebagai fallback kalau
         * pool makanan baru tidak cukup.
         */
        var EVER_EATEN_PENALTY = 60; // skor dikurangi 60 poin (dari skala ~0-100) kalau pernah dimakan

        function buildItem(food, mlScore, macroScore, everEaten) {
            var hybridScore = mlScore * 0.5 + macroScore * 0.5;
            if (everEaten) hybridScore -= EVER_EATEN_PENALTY;

            return {
                id: food.id !== undefined ? food.id : food.name,
                name: food.name,
                kalori: toNumber(food.kalori || food.calories),
                protein: toNumber(food.protein),
                carbs: toNumber(food.carbs),
                fat: toNumber(food.fat),
                score: hybridScore,
                mlScore: mlScore,
                macroScore: macroScore,
                everEaten: !!everEaten,
                recipe: food.recipe || null,
            };
        }

        function matchesMeal(food) {
            var mealList = Array.isArray(food.meal) ?
                food.meal : [food.meal_primary];

            return mealList.includes(meal);
        }

        /**
         * =====================================================
         * CANDIDATE POOL GENERATION
         * =====================================================
         */
        var pool = [];
        var seen = new Set();

        /**
         * PRIORITY: ML results, dengan macro fit score ditambahkan
         */
        for (var i = 0; i < mlNames.length; i++) {
            var key = normalizeStrict(mlNames[i].food_name);
            var food = foodByName.get(key);

            if (!food) continue;
            if (!matchesMeal(food)) continue;

            // HARD-EXCLUDE: makanan yang sudah dimakan HARI INI tidak
            // boleh muncul sama sekali.
            if (eatenToday.has(key)) continue;
            if (seen.has(key)) continue;

            var id = String(food.id || food.name);
            if (clientUsedIds.indexOf(id) !== -1) continue;

            seen.add(key);

            var mlScore = mlScoreMap.get(key) || 0;
            var macroScore = scoreMacroFit(food, goal);
            // SOFT-EXCLUDE: pernah ditrack kapan pun -> skor diturunkan,
            // tapi tetap masuk pool (lihat EVER_EATEN_PENALTY di buildItem)
            var everEaten = eatenHistory.has(key);

            pool.push(buildItem(food, mlScore, macroScore, everEaten));
        }

        /**
         * FALLBACK dataset jika ML kosong
         * Tetap diberi macro score walau tanpa ML score
         */
        if (pool.length === 0) {
            for (var i = 0; i < foodsData.length; i++) {
                var f = foodsData[i];
                var key = normalizeStrict(f.name);

                if (!matchesMeal(f)) continue;
                if (eatenToday.has(key)) continue; // HARD-EXCLUDE: hari ini saja
                if (seen.has(key)) continue;

                seen.add(key);

                var macroScore = scoreMacroFit(f, goal);
                var everEaten = eatenHistory.has(key); // SOFT-EXCLUDE
                pool.push(buildItem(f, 0, macroScore, everEaten));
            }
        }

        if (pool.length === 0) {
            return NextResponse.json({ recommendations: [] });
        }

        /**
         * =====================================================
         * RANKING + DIVERSITY CONTROL LAYER
         * =====================================================
         *
         * MASALAH SEBELUMNYA (tier-shuffle per 8):
         * Knapsack jalan deterministik dari skor tertinggi ke rendah.
         * Makanan rank #1 (mis. "Ubi Jalar Rebus") SELALU dicoba
         * duluan di setiap request, dan kalau kalorinya muat, dia
         * SELALU terpilih. Shuffle hanya mengacak posisi DALAM tier
         * skor yang sama, tapi tidak mencegah satu item dominan
         * selalu berada di tier teratas setiap kali endpoint dipanggil.
         * Hasilnya: makanan yang sama terus muncul, terasa membosankan.
         *
         * SOLUSI: WEIGHTED RANDOM SAMPLING (roulette wheel), TANPA
         * PENGEMBALIAN (tanpa tabel/log tambahan di DB).
         * - Makanan dengan score lebih tinggi punya PELUANG lebih
         *   besar terpilih duluan, tapi BUKAN kepastian mutlak.
         * - Setiap kali satu makanan "ditarik", dia dikeluarkan dari
         *   kandidat (tanpa pengembalian) sehingga urutan finalPool
         *   acak namun condong ke skor tinggi (exploration sambil
         *   tetap relevan terhadap goal/ML).
         * - Pendekatan ini standar di recommender system untuk
         *   menyeimbangkan "exploitation" (ambil yang paling cocok)
         *   dengan "exploration" (beri kesempatan ke makanan lain).
         */
        function weightedShuffle(items) {
            // skor bisa negatif (akibat EVER_EATEN_PENALTY), jadi
            // digeser dulu supaya semua weight > 0, plus base kecil
            // agar makanan skor rendah tetap punya peluang non-zero.
            var minScore = Math.min.apply(null, items.map((it) => it.score));
            var shift = minScore < 0 ? -minScore : 0;
            var BASE_WEIGHT = 1; // agar item skor 0 tetap punya peluang ditarik

            var candidates = items.map((it) => ({
                item: it,
                weight: it.score + shift + BASE_WEIGHT,
            }));

            var result = [];
            while (candidates.length > 0) {
                var totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
                var r = Math.random() * totalWeight;

                var acc = 0;
                var pickIndex = candidates.length - 1; // fallback safety
                for (var i = 0; i < candidates.length; i++) {
                    acc += candidates[i].weight;
                    if (r <= acc) {
                        pickIndex = i;
                        break;
                    }
                }

                result.push(candidates[pickIndex].item);
                candidates.splice(pickIndex, 1);
            }

            return result;
        }

        var finalPool = weightedShuffle(pool);

        /**
         * =====================================================
         * Hybrid heuristic knapsack
         * =====================================================
         * Seleksi mengikuti urutan finalPool (sudah prioritas
         * goal + ML + belum-pernah-dimakan), bukan urutan acak
         * total seperti sebelumnya.
         *
         * TIGA TAHAP (soft-exclude untuk riwayat tracking):
         * 1. Isi rekomendasi HANYA dari makanan yang belum pernah
         *    ditrack user (everEaten === false) selama kalori cukup.
         * 2. Kalau setelah tahap 1 jumlah rekomendasi masih kurang,
         *    baru isi sisa slot dari makanan yang pernah ditrack
         *    (everEaten === true).
         * 3. Top-up: kalau kalori masih tersisa >200 kcal, longgarkan
         *    toleransi (1.5x) untuk mengisi lebih penuh.
         *
         * Dinamis maxItems = max(5, ceil(sisaKalori / 150))
         * supaya makin besar budget makin banyak item yang bisa dipilih.
         * Toleransi overrun 10% seperti Python knapsack.
         *
         * Karena finalPool sudah di-sort berdasarkan score (dan
         * everEaten sudah kena penalti besar saat scoring), secara
         * alami makanan belum-pernah-dimakan akan duluan dipilih di
         * tahap 1 tanpa perlu sorting ulang. Tahap 2-3 hanya jaring
         * pengaman kalau tahap 1 belum cukup.
         */
        var recommendations = [];
        var remaining = sisaKalori;

        var maxItems = Math.max(5, Math.ceil(sisaKalori / 150));
        var TOLERANCE = 1.1;

        // Tahap 1: utamakan makanan yang belum pernah ditrack
        for (var i = 0; i < finalPool.length; i++) {
            var food = finalPool[i];
            if (food.everEaten) continue;

            if (recommendations.length >= maxItems) break;

            if (food.kalori <= remaining * TOLERANCE) {
                recommendations.push(food);
                remaining -= food.kalori;
            }
        }

        // Tahap 2: fallback ke makanan yang pernah ditrack, hanya jika
        // tahap 1 belum mencukupi rekomendasi
        if (recommendations.length < maxItems) {
            for (var i = 0; i < finalPool.length; i++) {
                var food = finalPool[i];
                if (!food.everEaten) continue;

                if (recommendations.length >= maxItems) break;

                if (food.kalori <= remaining * TOLERANCE) {
                    recommendations.push(food);
                    remaining -= food.kalori;
                }
            }
        }

        // Tahap 3 (top-up): kalau kalori masih banyak tersisa,
        // longgarkan toleransi untuk mengisi lebih penuh
        if (remaining > 200 && recommendations.length < maxItems) {
            var pickedSet = new Set();
            for (var k = 0; k < recommendations.length; k++) {
                pickedSet.add(normalizeStrict(recommendations[k].name));
            }

            for (var i = 0; i < finalPool.length; i++) {
                var food = finalPool[i];
                if (recommendations.length >= maxItems) break;
                if (pickedSet.has(normalizeStrict(food.name))) continue;

                if (food.kalori <= remaining * 1.5) {
                    recommendations.push(food);
                    remaining -= food.kalori;
                    pickedSet.add(normalizeStrict(food.name));
                }
            }
        }

        /**
         * FINAL CLEANING (anti duplicate final check)
         */
        var unique = new Map();

        for (var i = 0; i < recommendations.length; i++) {
            var f = recommendations[i];
            if (!f || !f.name) continue;

            var key = normalizeStrict(f.name);

            if (!unique.has(key) && !eatenToday.has(key)) {
                unique.set(key, f);
            }
        }

        // Urutan final tetap mengikuti skor (bukan shuffle total lagi)
        var finalRecs = Array.from(unique.values()).sort((a, b) => b.score - a.score);

        var totalCalories = finalRecs.reduce((a, b) => a + b.kalori, 0);

        /**
         * RESPONSE OUTPUT
         */
        return NextResponse.json({
            recommendations: finalRecs,
            goal: goal,
            totalCalories,
            remainingCalories: sisaKalori - totalCalories,
            usedFoodIds: finalRecs.map((f) => f.id),
        });

    } catch (e) {
        console.error("[Route Error]", e);

        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}