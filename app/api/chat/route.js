import foodData from "../../data/food_recommendations_with_recipes.json";

export async function POST(req) {
    try {
        const { message } = await req.json();
        const text = message.toLowerCase();

        function isInformationalQuestion(t) {
            const prefixes = [
                "apa itu", "apa yang", "apakah", "bagaimana", "kenapa",
                "mengapa", "jelaskan", "berapa", "kapan", "siapa",
                "what is", "what are", "how does", "why", "explain"
            ];
            return prefixes.some(function(q) {
                return t.startsWith(q) || t.includes(q);
            });
        }

        function isRecommendationQuery(t) {
            const intentKeywords = [
                "rekomendasikan", "rekomendasi", "kasih", "sarankan", "saran",
                "mau", "ingin", "pengen", "suggest", "recommend", "give me",
                "buatkan", "buat", "cari", "carikan"
            ];
            const foodKeywords = [
                "makan", "menu", "makanan", "kalori", "diet",
                "breakfast", "lunch", "dinner", "snack",
                "sarapan", "makan siang", "makan malam"
            ];
            const specificFoodRequest = [
                "lunch", "dinner", "breakfast", "snack",
                "makan siang", "makan malam", "sarapan"
            ];
            const hasIntent = intentKeywords.some(function(k) { return t.includes(k); });
            const hasFood = foodKeywords.some(function(k) { return t.includes(k); });
            const hasSpecific = specificFoodRequest.some(function(k) { return t.includes(k); });
            return (hasIntent && hasFood) || hasSpecific;
        }

        function parseInput(t) {
            var meal_enc = 2;
            if (t.includes("breakfast") || t.includes("sarapan")) {
                meal_enc = 0;
            } else if (t.includes("lunch") || t.includes("makan siang")) {
                meal_enc = 1;
            } else if (t.includes("dinner") || t.includes("makan malam")) {
                meal_enc = 2;
            } else if (t.includes("snack") || t.includes("cemilan")) {
                meal_enc = 3;
            }

            var remaining_calories = 600;
            var allNumbers = Array.from(t.matchAll(/(\d+)/g)).map(function(m) { return parseInt(m[1]); });
            var calorieCandidate = allNumbers.find(function(n) { return n >= 100 && n <= 2000; });
            if (calorieCandidate) remaining_calories = calorieCandidate;

            var goal_enc = 0;
            if (t.includes("diet") || t.includes("turun berat") || t.includes("kurus")) goal_enc = 1;
            if (t.includes("otot") || t.includes("muscle") || t.includes("bulking")) goal_enc = 2;

            var high_protein = (t.includes("protein") || t.includes("otot") || t.includes("muscle")) ? 1 : 0;
            var vegetarian = (t.includes("vegetarian") || t.includes("vegan") || t.includes("sayur")) ? 1 : 0;

            if (t.includes("tinggi kalori") || t.includes("high calorie")) {
                remaining_calories = Math.max(remaining_calories, 800);
            }
            if (t.includes("rendah kalori") || t.includes("low calorie")) {
                remaining_calories = Math.min(remaining_calories, 400);
            }

            return {
                goal_enc: goal_enc,
                meal_enc: meal_enc,
                remaining_calories: remaining_calories,
                vegetarian: vegetarian,
                high_protein: high_protein
            };
        }

        function isMealMatch(item, mealText) {
            if (item.meal_primary && item.meal_primary.toLowerCase() === mealText) {
                return true;
            }
            if (Array.isArray(item.meal)) {
                return item.meal.some(function(m) {
                    return m.toLowerCase() === mealText;
                });
            }
            return false;
        }

        function getFoodsFromLocal(mealText) {
            return foodData.filter(function(item) {
                return isMealMatch(item, mealText);
            });
        }

        function knapsack(recommendations, maxCalories) {
            if (!recommendations || recommendations.length === 0) return [];
            var items = recommendations.map(function(item) {
                var cal = item.calories || item.kalori || 300;
                var score = item.score || 1;
                return Object.assign({}, item, { calories: cal, score: score });
            });
            var n = items.length;
            var dp = [];
            for (var x = 0; x <= n; x++) {
                dp.push(new Array(maxCalories + 1).fill(0));
            }
            for (var i = 1; i <= n; i++) {
                for (var w = 0; w <= maxCalories; w++) {
                    if (items[i - 1].calories <= w) {
                        dp[i][w] = Math.max(
                            items[i - 1].score + dp[i - 1][w - items[i - 1].calories],
                            dp[i - 1][w]
                        );
                    } else {
                        dp[i][w] = dp[i - 1][w];
                    }
                }
            }
            var remaining = maxCalories;
            var selected = [];
            for (var j = n; j > 0; j--) {
                if (dp[j][remaining] !== dp[j - 1][remaining]) {
                    selected.push(items[j - 1]);
                    remaining -= items[j - 1].calories;
                }
            }
            return selected;
        }

        async function callAI(systemPrompt, userPrompt) {
            var res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.OPENROUTER_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openai/gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userPrompt }
                    ]
                })
            });
            var data = await res.json();
            return data.choices[0].message.content;
        }

        // PRIORITAS 1: Pertanyaan informatif langsung AI
        if (isInformationalQuestion(text)) {
            var reply = await callAI(
                "Kamu adalah asisten nutrisi yang menjawab dengan santai, jelas, dan informatif.",
                message
            );
            return Response.json({ reply: reply, source: "ai" });
        }

        // PRIORITAS 2: Request rekomendasi
        if (isRecommendationQuery(text)) {
            var payload = parseInput(text);
            var mealMap = ["breakfast", "lunch", "dinner", "snack"];
            var mealText = mealMap[payload.meal_enc];

            var finalFoods = [];

            // Coba GBDT dulu
            var mlData = null;
            try {
                var mlRes = await fetch("http://localhost:8000/predict", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(Object.assign({}, payload, { top_n: 10 }))
                });
                mlData = await mlRes.json();
            } catch (e) {
                console.log("ML error, fallback ke local JSON:", e.message);
            }

            // Kalau GBDT berhasil, filter by meal dari hasil GBDT
            if (mlData && mlData.recommendations && mlData.recommendations.length > 0) {
                var filteredML = mlData.recommendations.filter(function(item) {
                    return isMealMatch(item, mealText);
                });
                if (filteredML.length > 0) {
                    var selected = knapsack(filteredML, payload.remaining_calories);
                    finalFoods = selected.length > 0 ? selected : filteredML.slice(0, 3);
                }
            }

            // Kalau GBDT gagal atau hasil filter kosong, ambil dari local JSON
            if (finalFoods.length === 0) {
                console.log("Ambil dari local JSON untuk meal:", mealText);
                var localFoods = getFoodsFromLocal(mealText);
                if (localFoods.length > 0) {
                    var selectedLocal = knapsack(localFoods, payload.remaining_calories);
                    finalFoods = selectedLocal.length > 0 ? selectedLocal : localFoods.slice(0, 3);
                }
            }

            // Ada makanan dari data → format pakai AI
            if (finalFoods.length > 0) {
                var recommendationText = finalFoods.map(function(item) {
                    return "- " + (item.food_name || item.name || "");
                }).join("\n");

                var systemPrompt = "Kamu adalah chef profesional dan asisten nutrisi.\n" +
                    "Tugas kamu adalah membuat rekomendasi makanan yang natural, santai, dan enak dibaca seperti food blogger.\n\n" +
                    "ATURAN SANGAT WAJIB:\n" +
                    "- Gunakan HANYA makanan dari daftar yang diberikan\n" +
                    "- DILARANG KERAS menambahkan makanan baru di luar daftar\n" +
                    "- Jika daftar kosong, katakan tidak ada menu tersedia\n" +
                    "- Fokus pada menu " + mealText + "\n\n" +
                    "GAYA PENULISAN:\n" +
                    "- Gunakan paragraf natural (bukan list/bullet)\n" +
                    "- Bahasa santai, mengalir, tidak kaku\n" +
                    "- Seperti ngobrol, bukan laporan";

                var userPrompt = "User request: " + message + "\n" +
                    "Meal: " + mealText + "\n\n" +
                    "Daftar makanan yang WAJIB digunakan (jangan tambah yang lain):\n" +
                    recommendationText + "\n\n" +
                    "Rekomendasikan menu dari daftar di atas saja dengan gaya natural seperti chef.";

                var hybridReply = await callAI(systemPrompt, userPrompt);
                return Response.json({
                    reply: hybridReply,
                    source: "hybrid",
                    meal: mealText,
                    foods_used: finalFoods
                });
            }

            // Data juga kosong → serahkan ke AI
            var aiReply = await callAI(
                "Kamu adalah asisten nutrisi yang menjawab dengan santai dan jelas.",
                message
            );
            return Response.json({ reply: aiReply, source: "ai" });
        }

        // PRIORITAS 3: Semua kasus lain → AI
        var fallbackReply = await callAI(
            "Kamu adalah asisten nutrisi yang menjawab dengan santai dan jelas.",
            message
        );
        return Response.json({ reply: fallbackReply, source: "ai" });

    } catch (err) {
        console.error(err);
        return Response.json({ reply: "Terjadi kesalahan pada sistem", source: "error" });
    }
}