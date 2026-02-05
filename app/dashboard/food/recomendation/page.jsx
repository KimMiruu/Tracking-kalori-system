// app/page.jsx
'use client'

import { useEffect, useState, useRef } from 'react'


/* Improved UI + very tidy Recipe modal (better typography, spacing, macros) */

/* constants */
const COOKED_JSON_URL = '/api/cooked-foods'

/* helpers */
function normalizeCookedArray(data) {
  if (!Array.isArray(data)) return []
  return data.map((it, idx) => {
    const id = it.id ?? it.label ?? `cooked-${idx}`
    return {
      id,
      name: it.nama_makanan ?? it.name ?? it.nama ?? it.title ?? `Makanan ${idx + 1}`,
      kalori: Number(it.kalori ?? it.kcal ?? it.calories ?? 0),
      protein: Number(it.protein ?? it.protein_g ?? it.protein_gram ?? 0),
      carbs: Number(it.carbs ?? it.carbohydrate ?? it.carbohidrat ?? 0),
      fat: Number(it.fat ?? it.lemak ?? 0),
      tags: it.tags ?? it.kategori ?? [],
      recipe: it.recipe ?? it.resep ?? null
    }
  })
}

function pickFoods(arr, targetKcal, maxItems = 3) {
  if (!Array.isArray(arr) || arr.length === 0) return []
  const sorted = arr.slice().sort((a, b) => Math.abs(targetKcal - a.kalori) - Math.abs(targetKcal - b.kalori))
  return sorted.slice(0, maxItems)
}

function generateDailyPlan(sisaKalori, cookedArr) {
  const targetSarapan = Math.round(sisaKalori * 0.25)
  const targetSiang = Math.round(sisaKalori * 0.35)
  const targetMalam = Math.round(sisaKalori * 0.30)
  const targetCamilan = Math.round(sisaKalori * 0.10)

  const byTag = {}
  cookedArr.forEach((it) => {
    if (!Array.isArray(it.tags) || it.tags.length === 0) {
      const tag = 'lainnya'
      byTag[tag] = byTag[tag] || []
      byTag[tag].push(it)
    } else {
      it.tags.forEach((tag) => {
        byTag[tag] = byTag[tag] || []
        byTag[tag].push(it)
      })
    }
  })

  function getGroup(meal) {
    if (meal === 'sarapan') return byTag['sarapan'] || byTag['breakfast'] || cookedArr
    if (meal === 'makan_siang') return byTag['siang'] || byTag['lunch'] || cookedArr
    if (meal === 'makan_malam') return byTag['malam'] || byTag['dinner'] || cookedArr
    if (meal === 'camilan') return byTag['camilan'] || byTag['snack'] || cookedArr
    return cookedArr
  }

  const byMeal = {}
  byMeal.sarapan = pickFoods(getGroup('sarapan'), targetSarapan)
  byMeal.makan_siang = pickFoods(getGroup('makan_siang'), targetSiang)
  byMeal.makan_malam = pickFoods(getGroup('makan_malam'), targetMalam)
  byMeal.camilan = pickFoods(getGroup('camilan'), targetCamilan)

  return {
    byMeal,
    targets: { targetSarapan, targetSiang, targetMalam, targetCamilan }
  }
}

function fmt(n) {
  if (typeof n !== 'number') return n
  return n.toLocaleString('id-ID')
}

/* style tokens */
const brand = {
  purple: '#7c3aed',
  teal: '#06b6d4',
  orange: '#fb923c',
  green: '#10b981',
  red: '#ef4444',
  muted: '#64748b',
  bg: '#fbfdff'
}

const palette = {
  bgPage: '#f4f6f8',        // ⬅️ lebih gelap dikit dari sebelumnya

  heroBase: '#e6ebe8',      // ⬅️ sage gray lebih pekat
  heroTint: '#dde5e1',      // ⬅️ masih soft tapi kerasa

  card: '#f1f3f5',          // ⬅️ bukan putih, tapi light gray
  border: '#d1d5db',

  textMain: '#0f172a',
  textMuted: '#475569',     // ⬅️ teks sekunder lebih kebaca

  accent: '#22c55e',
  accentSoft: '#dcfce7',

  accentAlt: '#fb923c'      // oranye lembut (siang)
}



const C = {
  page: {
    maxWidth: 1150,
    margin: '0 auto',
    padding: '120px 18px 80px',
    background: brand.bg
  },

  statBadge: {
  display: 'inline-block',
  padding: '6px 12px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.3px',
  marginBottom: 8
},

  /* HERO CARD */
 hero: {
  borderRadius: 26,
  padding: '32px',
  background: `linear-gradient(
    180deg,
    ${palette.heroTint},
    ${palette.heroBase}
  )`,
  border: `1px solid ${palette.border}`,
  boxShadow: '0 24px 60px rgba(15,23,42,0.12)',
  color: palette.textMain
},





  /* HERO MAIN NUMBER (STEP B) */
  heroMainValue: {
  fontSize: 44,
  fontWeight: 900,
  color: '#065f46',
  lineHeight: 1,
  letterSpacing: '-0.5px'
},


  heroMainLabel: {
    fontSize: 13,
    color: brand.muted,
    marginTop: 6
  },

  /* OLD STYLES (AMAN DIBIARIN) */
  heroRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap'
  },

  heroText: { fontSize: 18, fontWeight: 700, margin: 0 },
  heroSub: { fontSize: 13, marginTop: 6, opacity: 0.95 },


statCard: {
  background: palette.card,
  borderRadius: 18,
  padding: 16,
  border: `1px solid ${palette.border}`,
  boxShadow: '0 12px 28px rgba(15,23,42,0.06)'
},



  statLabel: { fontSize: 12, opacity: 0.85 },
statValue: { fontSize: 18, fontWeight: 800, marginTop: 6 },

statMiniLabel: {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.4px',
  background: '#e5f4ec',   // hijau abu soft
  color: '#166534',        // hijau gelap tapi kalem
  marginBottom: 6
},


  meals: { marginTop: 18 },

  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginTop: 18,
    marginBottom: 8
  },

  sectionH2: { fontSize: 16, fontWeight: 800, margin: 0 },

  mealCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 8px 30px rgba(2,6,23,0.04)',
    marginBottom: 12,
    borderLeft: '6px solid #fff'
  },

  left: { display: 'flex', gap: 12, alignItems: 'center' },
  name: { fontWeight: 800, fontSize: 15, color: '#0f172a' },
  meta: { color: brand.muted, fontSize: 13 },
  right: { textAlign: 'right', minWidth: 120, color: brand.muted },

  badge: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    background: '#fff',
    boxShadow: '0 2px 6px rgba(2,6,23,0.04)',
    fontSize: 12
  }
}

const accent = {
  sarapan: brand.green,
  makan_siang: brand.orange,
  makan_malam: brand.purple,
  camilan: brand.red
}

const Skeleton = ({ width = '70%' }) => <div style={{ height: 12, width, background: '#eef2ff', borderRadius: 6 }} />

/* Main component */
export default function FoodRecommendationPage() {

  // 1️⃣ SEMUA STATE & REF DULU
  const [isUserReady, setIsUserReady] = useState(false);
  const usedFoodIdsRef = useRef(new Set());

  const [sisaKalori, setSisaKalori] = useState(null);
  const [kaloriSummary, setKaloriSummary] = useState(null);
  const [loadingKalori, setLoadingKalori] = useState(true);
  const [errorKalori, setErrorKalori] = useState(null);
  const [activeMealFilter, setActiveMealFilter] = useState('all')
  const [goal, setGoal] = useState("maintenance");
  const isKaloriReady =
  typeof sisaKalori === 'number' &&
  kaloriSummary &&
  typeof kaloriSummary.targetKalori === 'number'

  const [preferences, setPreferences] = useState({
  avoidFried: false,
  highProtein: false
});



  // ===============================
// FETCH SISA KALORI (WAJIB ADA)
// ===============================
const fetchKaloriDikonsumsi = async (userId, email) => {
  try {
    const tanggal = new Date().toISOString().slice(0, 10)

    const query = userId
      ? `userId=${userId}&tanggal=${tanggal}`
      : `email=${encodeURIComponent(email)}&tanggal=${tanggal}`

    const res = await fetch(`/api/tracking?${query}`)
    const data = await res.json()

    if (!res.ok || !data?.detail_makanan) return 0

    const meals = JSON.parse(data.detail_makanan)

    return meals.reduce((total, meal) => {
      const foods = meal.foods || []
      return (
        total +
        foods.reduce(
          (sum, food) => sum + Number(food.calories || 0),
          0
        )
      )
    }, 0)
  } catch (err) {
    console.error('fetchKaloriDikonsumsi error:', err)
    return 0
  }
}

const fetchSisaKalori = async () => {
  try {
    setLoadingKalori(true)

    const raw =
      localStorage.getItem('userData') ??
      localStorage.getItem('user')

    if (!raw) return
    const parsed = JSON.parse(raw)
    const user = parsed.user || parsed.data || parsed

    const userId = user.id_user ?? user.id ?? null
    const email = user.email ?? null
    const tanggal = new Date().toISOString().slice(0, 10)

    const qs = userId
      ? `id_user=${userId}&tanggal=${tanggal}`
      : `email=${encodeURIComponent(email)}&tanggal=${tanggal}`

    const res = await fetch(`/api/tracking?${qs}`)
    const tracking = await res.json()

    if (!res.ok || !tracking) throw new Error('Tracking kosong')

const targetKalori =
  Number(
    tracking?.target_kalori ??
    tracking?.targetKalori ??
    localStorage.getItem(`targetKalori_${userId}`) ??
    localStorage.getItem(`targetKalori_${email}`)
  ) || 0




   // 🔥 HITUNG REAL DARI DETAIL_MAKANAN
const dikonsumsi = await fetchKaloriDikonsumsi(userId, email)

// ⛔ kalau belum ada fitur olahraga → set 0
const dibakar = Number(tracking.kalori_dibakar ?? 0)


    const sisa =
      targetKalori - dikonsumsi + dibakar

    setKaloriSummary({
      targetKalori,
      dikonsumsi,
      dibakar
    })

    setSisaKalori(Math.max(0, sisa))
  } catch (err) {
    console.error(err)
    setErrorKalori('Gagal ambil data tracking')
  } finally {
    setLoadingKalori(false)
  }
}


useEffect(() => {
  const handler = () => {
    console.log('🔄 tracking-updated → refetch sisa kalori & rekomendasi')
    fetchSisaKalori()
  }

  window.addEventListener('tracking-updated', handler)
  return () => window.removeEventListener('tracking-updated', handler)
}, [])


  const [dailyPlan, setDailyPlan] = useState({
    sarapan: [],
    makan_siang: [],
    makan_malam: [],
    camilan: []
  });

  const [serverRecommendations, setServerRecommendations] = useState({
    sarapan: null,
    makan_siang: null,
    makan_malam: null,
    camilan: null
  });

  const [loadingServerRec, setLoadingServerRec] = useState(false);
  const [serverError, setServerError] = useState(null);

  const [userId, setUserId] = useState(null);
  const [cookedFoods, setCookedFoods] = useState(null);
  const [combinedFoods, setCombinedFoods] = useState([]);

  const [openRecipe, setOpenRecipe] = useState(null);

  // 2️⃣ BARU LOGIC TURUNAN
  const LOW_BUDGET_THRESHOLD = 300;
  const isLowBudget =
    typeof sisaKalori === 'number' &&
    sisaKalori <= LOW_BUDGET_THRESHOLD;

    const kaloriTarget = kaloriSummary?.targetKalori || 0;
const kaloriDikonsumsi = kaloriSummary?.dikonsumsi || 0;

const kaloriPercent =
  kaloriTarget > 0
    ? Math.min(100, (kaloriDikonsumsi / kaloriTarget) * 100)
    : 0;


 async function handleAddToTracking(food) {
  try {
    const raw =
      localStorage.getItem('userData') ??
      localStorage.getItem('user')

    if (!raw) return alert('User belum login')

    const parsed = JSON.parse(raw)
    const user = parsed.user || parsed.data || parsed

    const id_user =
      user.id_user ||
      user.id ||
      user.userId

    const email = user.email

    if (!id_user && !email) return alert('User tidak valid')

    const tanggal = new Date().toISOString().slice(0, 10)

    // 1️⃣ AMBIL TRACKING HARI INI
    const qs = id_user
      ? `id_user=${id_user}&tanggal=${tanggal}`
      : `email=${encodeURIComponent(email)}&tanggal=${tanggal}`

    const existingRes = await fetch(`/api/tracking?${qs}`)
    const existing = await existingRes.json()

    // 2️⃣ AMBIL MEALS LAMA
    let meals = []
    if (existing?.detail_makanan) {
      try {
        meals = JSON.parse(existing.detail_makanan) || []
      } catch {}
    }

    // 3️⃣ CARI / BUAT MEAL GROUP
    let meal = meals.find(m => m.mealKey === food.mealKey)
    if (!meal) {
      meal = { mealKey: food.mealKey, foods: [] }
      meals.push(meal)
    }

    // 4️⃣ TAMBAH MAKANAN BARU
    meal.foods.push({
      name: food.name,
      calories: Math.round(food.kalori || 0),
      protein: Math.round(food.protein || 0),
      carbs: Math.round(food.carbs || 0),
      fat: Math.round(food.fat || 0)
    })

    // 5️⃣ KIRIM ULANG SEMUA MEALS
    const payload = {
      id_user,
      email,
      tanggal,
      meals
    }

    const res = await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error || data.message)

    window.dispatchEvent(new Event('tracking-updated'))
    alert('✅ Ditambahkan & dikalkulasi')
    setOpenRecipe(null)

  } catch (err) {
    console.error(err)
    alert('❌ Gagal menambahkan tracking')
  }
}


/* =====================================================
   FETCH SISA KALORI
===================================================== */
useEffect(() => {
  fetchSisaKalori()
}, [])

/* =====================================================
   LOAD COOKED FOODS
===================================================== */
useEffect(() => {
  let mounted = true

  async function loadCooked() {
    try {
      const res = await fetch(COOKED_JSON_URL)
      if (!res.ok) throw new Error('Gagal memuat cooked foods')

      const data = await res.json()
      const arr = normalizeCookedArray(
        Array.isArray(data) ? data : data.foods || []
      )

      if (mounted) {
        setCookedFoods(arr)
        setCombinedFoods(arr)
      }
    } catch (err) {
      console.error('Error loading cooked JSON', err)
      if (mounted) {
        setCookedFoods([])
        setCombinedFoods([])
      }
    }
  }

  loadCooked()
  return () => { mounted = false }
}, [])

/* =====================================================
   🔥 RENDER HELPER (SATU-SATUNYA)
===================================================== */
const getRenderedFoodsForKey = (key) => {
  const srv = serverRecommendations?.[key]
  if (!Array.isArray(srv)) return []

  return srv.map((item, index) => {
    const localMatch = combinedFoods?.find((f) => {
      const a = String(f?.name || '').toLowerCase().trim()
      const b = String(item?.nama || item?.name || '').toLowerCase().trim()
      return a === b
    })

    return {
      id: item.id_makanan ?? item.id ?? `${key}-${index}`,
      name: item.nama ?? item.name ?? localMatch?.name ?? `Makanan ${index + 1}`,
      kalori: item.kalori ?? item.calories ?? localMatch?.kalori ?? 0,
      protein: item.protein ?? localMatch?.protein ?? 0,
      carbs: item.carbs ?? item.carbohidrat ?? localMatch?.carbs ?? 0,
      fat: item.fat ?? item.lemak ?? localMatch?.fat ?? 0,
      recipe: item.recipe ?? localMatch?.recipe ?? null
    }
  })
}

/* =====================================================
   🔥 FETCH REKOMENDASI (FIX TARGETS)
===================================================== */
useEffect(() => {
  if (sisaKalori == null) return
  if (!Array.isArray(combinedFoods) || combinedFoods.length === 0) return

  // ✅ DEFAULT TARGETS (ANTI UNDEFINED)
  let targets = {
    targetSarapan: 0,
    targetSiang: 0,
    targetMalam: 0,
    targetCamilan: 0
  }

  if (!isLowBudget) {
    const generated = generateDailyPlan(sisaKalori, combinedFoods)
    setDailyPlan(generated.byMeal)
    targets = generated.targets
  } else {
    setDailyPlan({
      sarapan: [],
      makan_siang: [],
      makan_malam: [],
      camilan: []
    })
  }

  const fetchRecommendations = async () => {
    try {
      setLoadingServerRec(true)
      setServerError(null)

      const mapping = isLowBudget
        ? {
            camilan: {
              apiMeal: 'snack',
              sisa: sisaKalori
            }
          }
        : {
            sarapan: {
              apiMeal: 'breakfast',
              sisa: targets.targetSarapan
            },
            makan_siang: {
              apiMeal: 'lunch',
              sisa: targets.targetSiang
            },
            makan_malam: {
              apiMeal: 'dinner',
              sisa: targets.targetMalam
            },
            camilan: {
              apiMeal: 'snack',
              sisa: targets.targetCamilan
            }
          }

      const nextServerRecs = {}
      usedFoodIdsRef.current.clear()

      for (const key of Object.keys(mapping)) {
        const info = mapping[key]

        const res = await fetch('/api/recomendation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
  userId,
  sisaKalori: info.sisa,
  meal: info.apiMeal,
  recentFoodIds: Array.from(usedFoodIdsRef.current),
  goal: goal,
  preferences: preferences
})

        })

        const data = await res.json()
        const list = res.ok ? data.recommendations || [] : []

        list.forEach(item => {
          const id = item.id_makanan || item.id
          if (id != null) {
            usedFoodIdsRef.current.add(Number(id))
          }
        })

        nextServerRecs[key] = list
      }

      setServerRecommendations(nextServerRecs)
    } catch (err) {
      console.error(err)
      setServerError(err.message || String(err))
    } finally {
      setLoadingServerRec(false)
    }
  }

  fetchRecommendations()
}, [
  sisaKalori,
  combinedFoods,
  isLowBudget,
  goal,
  preferences
])



  function accentColorFor(key) { return accent[key] ?? brand.purple }

  /* Recipe modal: tidy formatting */
  function RecipeModal({ open, data, onClose }) {
  if (!open || !data) return null

  const recipe =
    typeof data.recipe === 'object'
      ? data.recipe
      : typeof data.recipe === 'string'
      ? { description: data.recipe }
      : {}

  const ingredients =
    Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : Array.isArray(recipe.bahan)
      ? recipe.bahan
      : typeof recipe.ingredients === 'string'
      ? recipe.ingredients.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean)
      : typeof recipe.bahan === 'string'
      ? recipe.bahan.split(/\r?\n|,|;/).map(s => s.trim()).filter(Boolean)
      : []

  const steps =
    Array.isArray(recipe.steps)
      ? recipe.steps
      : Array.isArray(recipe.langkah)
      ? recipe.langkah
      : typeof recipe.steps === 'string'
      ? recipe.steps.split(/\r?\n/).filter(Boolean)
      : typeof recipe.langkah === 'string'
      ? recipe.langkah.split(/\r?\n/).filter(Boolean)
      : []

  const macros = {
    kalori: Number(recipe.kalori ?? recipe.calories ?? data.kalori ?? 0),
    protein: Number(recipe.protein ?? data.protein ?? 0),
    carbs: Number(recipe.carbs ?? data.carbs ?? 0),
    fat: Number(recipe.fat ?? data.fat ?? 0)
  }

  const macroCard = (bg, color) => ({
    flex: 1,
    padding: '12px 14px',
    borderRadius: 14,
    background: bg,
    color,
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)'
  })

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,23,42,0.45)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div
  style={{
    width: 'min(900px,96%)',
    maxHeight: '90vh',
    overflow: 'auto',
    background: 'linear-gradient(180deg,#ffffff,#f8fafc)',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 30px 80px rgba(15,23,42,0.35)',

    // ✅ TAMBAHKAN INI
    fontFamily:
      '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
  }}
>


        {/* HEADER */}
        <div style={{
          background: `linear-gradient(90deg, ${brand.purple}, ${brand.teal})`,
          padding: '18px 22px',
          borderRadius: 16,
          color: '#fff',
          marginBottom: 18
        }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>
            {data.name}
          </h3>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
            ⏱ {recipe.cook_time_min ?? '—'} menit • 🍽 {recipe.servings ?? 1} porsi
          </div>
        </div>

        {/* MACROS */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={macroCard('#ecfeff', '#0f766e')}>
            <div style={{ fontSize: 12 }}>Kalori</div>
            <div style={{ fontWeight: 900 }}>{fmt(macros.kalori)} kcal</div>
          </div>
          <div style={macroCard('#f0fdf4', '#166534')}>
            <div style={{ fontSize: 12 }}>Protein</div>
            <div style={{ fontWeight: 900 }}>{macros.protein} g</div>
          </div>
          <div style={macroCard('#fff7ed', '#9a3412')}>
            <div style={{ fontSize: 12 }}>Karbo</div>
            <div style={{ fontWeight: 900 }}>{macros.carbs} g</div>
          </div>
          <div style={macroCard('#fef2f2', '#991b1b')}>
            <div style={{ fontSize: 12 }}>Lemak</div>
            <div style={{ fontWeight: 900 }}>{macros.fat} g</div>
          </div>
        </div>

        {/* CONTENT */}
        <div
      style={{
      background: '#f8fafc',
      padding: 18,
      borderRadius: 14,
      border: '1px solid rgba(15,23,42,0.06)'
    }}>
  <h4
  style={{
    marginBottom: 10,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.2px',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}
>
  🧺 Bahan
</h4>


  <ul
    style={{
      margin: 0,
    paddingLeft: 18,
    fontSize: 14.5,
    lineHeight: 1.85,
    fontWeight: 400,
    color: '#334155',
    letterSpacing: '0.1px'
    }}
  >
    {ingredients.map((ing, i) => (
     <li
  key={i}
  style={{
    marginBottom: 8
  }}
>
  {ing}
</li>

    ))}
  </ul>
</div>

<div
  style={{
    background: '#ffffff',
    padding: 18,
    borderRadius: 14,
    border: '1px solid rgba(15,23,42,0.06)'
  }}
>
  <h4
  style={{
    marginBottom: 10,
    fontSize: 15,
    fontWeight: 700,
    letterSpacing: '0.2px',
    color: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  }}
>
  👨‍🍳 Langkah
</h4>


  <ol
    style={{
       margin: 0,
    paddingLeft: 20,
    fontSize: 14.5,
    lineHeight: 1.9,
    fontWeight: 400,
    color: '#334155',
    letterSpacing: '0.1px'
    }}
  >
    {steps.map((s, i) => (
      <li
  key={i}
  style={{
    marginBottom: 10
  }}
>
  {s}
</li>
    ))}
  </ol>
</div>


        {/* ACTION */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}>
          <button
            onClick={() => handleAddToTracking(data)}
            style={{
              background: `linear-gradient(90deg, ${brand.purple}, ${brand.teal})`,
              color: '#fff',
              padding: '12px 18px',
              borderRadius: 14,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 28px rgba(124,58,237,0.4)'
            }}
          >
            Tambah ke Tracking
          </button>

          <button
            onClick={onClose}
            style={{
              background: '#fff',
              border: '1px solid rgba(15,23,42,0.08)',
              padding: '12px 18px',
              borderRadius: 14,
              cursor: 'pointer'
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

  return (
    <div style={C.page}>
     <div
  style={{
    maxWidth: 780,
    paddingLeft: 18,
    borderLeft: '6px solid #1fb6a6',
    marginBottom: 32
  }}
>
  <h1
    style={{
      fontSize: 32,
      fontWeight: 900,
      margin: 0,
      letterSpacing: '-0.4px'
    }}
  >
    Rekomendasi Makanan
  </h1>

  <p
    style={{
      marginTop: 6,
      fontSize: 14,
      color: '#64748b'
    }}
  >
    Disesuaikan dengan sisa kalori dan pola makan kamu hari ini
  </p>
</div>


{/* =========================
   STATUS KALORI + CONTROL
========================= */}
<div
  style={{
    width: '100%',
    background: 'linear-gradient(180deg,#ecfdf5,#ffffff)',
    borderRadius: 24,
    padding: 24,
    border: '1px solid #d1fae5',
    boxShadow: '0 18px 48px rgba(15,23,42,0.10)',
    marginBottom: 32
  }}
>
  {/* ===== TOP: SISA KALORI ===== */}
  <div
    style={{
      background: '#ecfdf5',
      borderRadius: 18,
      padding: '20px 24px',
      border: '1px solid #a7f3d0'
    }}
  >
    <div
      style={{
        display: 'inline-block',
        padding: '6px 14px',
        borderRadius: 999,
        background: '#22c55e',
        color: '#fff',
        fontSize: 12,
        fontWeight: 800,
        marginBottom: 10
      }}
    >
      SISA KALORI HARI INI
    </div>

    <div
      style={{
        fontSize: 40,
        fontWeight: 900,
        lineHeight: 1.1,
        color: '#16a34a'
      }}
    >
      {isKaloriReady ? (
  <>{fmt(sisaKalori)} kcal</>
) : (
  <span style={{ opacity: 0.5 }}>Memuat...</span>
)}

    </div>
  </div>

  {/* ===== STATS ===== */}
  <div
    style={{
      marginTop: 20,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))',
      gap: 16
    }}
  >
    <div style={C.statCard}>
      <div style={{ ...C.statBadge, background: '#f1f5f9' }}>
        TARGET
      </div>
      <div style={C.statValue}>
        {fmt(kaloriSummary?.targetKalori ?? 0)} kcal
      </div>
    </div>

    <div style={C.statCard}>
      <div style={{ ...C.statBadge, background: '#fff7ed', color: '#ea580c' }}>
        DIKONSUMSI
      </div>
      <div style={C.statValue}>
        {fmt(kaloriSummary?.dikonsumsi ?? 0)} kcal
      </div>
    </div>

    <div style={C.statCard}>
      <div style={{ ...C.statBadge, background: '#f1f5f9', color: '#64748b' }}>
        DIBAKAR
      </div>
      <div style={C.statValue}>
        {fmt(kaloriSummary?.dibakar ?? 0)} kcal
      </div>
    </div>
  </div>

  {/* ===== DIVIDER ===== */}
  <div
    style={{
      height: 1,
      background: '#e5e7eb',
      margin: '24px 0'
    }}
  />

  {/* ===== PROGRESS ===== */}
  <div style={{ marginBottom: 22 }}>
    <div
      style={{
        fontSize: 13,
        fontWeight: 800,
        marginBottom: 6
      }}
    >
      Progress Kalori ({Math.round(kaloriPercent)}%)
    </div>

    <div
      style={{
        height: 8,
        background: '#e5e7eb',
        borderRadius: 999,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          width: `${kaloriPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg,#22c55e,#16a34a)'
        }}
      />
    </div>

    <div
      style={{
        fontSize: 12,
        color: '#64748b',
        marginTop: 4
      }}
    >
      {kaloriSummary?.dikonsumsi} dari {kaloriSummary?.targetKalori} kcal
    </div>
  </div>

  {/* ===== GOAL ===== */}
  <div style={{ marginBottom: 20 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 6
      }}
    >
      Tujuan
    </div>

    <select
      value={goal}
      onChange={(e) => setGoal(e.target.value)}
      style={{
        width: '100%',
        padding: '10px 14px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        border: '1px solid rgba(15,23,42,0.12)',
        cursor: 'pointer'
      }}
    >
      <option value="fat_loss">🔥 Turun Berat</option>
      <option value="muscle_gain">💪 Naik Otot</option>
      <option value="maintenance">⚖️ Jaga Berat</option>
    </select>
  </div>

  {/* ===== PREFERENSI ===== */}
  <div>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 8
      }}
    >
      Preferensi
    </div>

    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
      <PrefChip
        active={preferences.avoidFried}
        label="🚫 Hindari Gorengan"
        onClick={() =>
          setPreferences(p => ({ ...p, avoidFried: !p.avoidFried }))
        }
      />

      <PrefChip
        active={preferences.highProtein}
        label="💪 Protein Tinggi"
        onClick={() =>
          setPreferences(p => ({ ...p, highProtein: !p.highProtein }))
        }
      />
    </div>
  </div>
</div>

{/* ERROR */}
{(errorKalori || serverError) && (
  <div style={{ marginTop: 12, fontSize: 13, color: '#b91c1c' }}>
    {errorKalori || serverError}
  </div>
)}


      {/* FILTER MEAL */}
<div
  style={{
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    marginBottom: 20
  }}
>
  {[
    { key: 'all', label: '🍛  Semua' },
    { key: 'sarapan', label: '🍳 Sarapan' },
    { key: 'makan_siang', label: '🍽️ Makan Siang' },
    { key: 'makan_malam', label: '🌙 Makan Malam' },
    { key: 'camilan', label: '🍪 Camilan' }
  ].map(item => (
    <button
      key={item.key}
      onClick={() => setActiveMealFilter(item.key)}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        border:
          activeMealFilter === item.key
            ? 'none'
            : '1px solid rgba(15,23,42,0.12)',
        background:
          activeMealFilter === item.key
            ? `linear-gradient(90deg, ${brand.purple}, ${brand.teal})`
            : '#ffffff',
        color:
          activeMealFilter === item.key
            ? '#ffffff'
            : '#0f172a',
        boxShadow:
          activeMealFilter === item.key
            ? '0 6px 18px rgba(124,58,237,0.35)'
            : 'none'
      }}
    >
      {item.label}
    </button>
  ))}
</div>


      <div style={C.meals}>
        {['sarapan','makan_siang','makan_malam','camilan']
 .filter(key => {
  if (activeMealFilter === 'all') {
    return !isLowBudget || key === 'camilan'
  }
  return key === activeMealFilter
}).map((key) => {
          const foods = getRenderedFoodsForKey(key)
          const title = key === 'sarapan' ? 'Sarapan' : key === 'makan_siang' ? 'Makan Siang' : key === 'makan_malam' ? 'Makan Malam' : 'Camilan'
          return (
         <section key={key} style={{ marginBottom: 48 }}>
 <div style={{ position: 'relative', marginBottom: 30 }}>
  {/* guide line */}
  <div
    style={{
      position: 'absolute',
      left: 18,
      top: 50,
      bottom: -20,
      width: 2,
      background: `${accentColorFor(key)}22`
    }}
  />

  {/* pill header */}
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '14px 24px',
      borderRadius: 999,
      background: '#ffffff',
      boxShadow: '0 18px 50px rgba(15,23,42,0.14)',
      border: `1px solid ${accentColorFor(key)}33`,
      position: 'relative',
      zIndex: 2
    }}
  >
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: accentColorFor(key),
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 800
      }}
    >
      {key === 'sarapan' ? '🍳' :
       key === 'makan_siang' ? '🍽️' :
       key === 'makan_malam' ? '🌙' : '🍪'}
    </div>

    <div>
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: '0.4px',
          textTransform: 'uppercase'
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 12, color: brand.muted }}>
        {foods.length} menu rekomendasi
      </div>
    </div>
  </div>
</div>


              {loadingServerRec ? (
                <div
  style={{
    background: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}
>

                  <div style={C.left}>
                    <div style={{ width: 8, height: 36, borderRadius: 6, background: `${accentColorFor(key)}22` }} />
                    <div>
                      <div style={{ height: 14, width: 240, background: '#eef2ff', borderRadius: 6 }} />
                      <div style={{ height: 12, width: 120, background: '#f0f7ff', borderRadius: 6, marginTop: 8 }} />
                    </div>
                  </div>
                  <div style={C.right}><div style={{ height: 14, width: 60, background: '#eef2ff', borderRadius: 6 }} /></div>
                </div>
              ) : !foods || foods.length === 0 ? (
                <div style={C.statCard}>Belum ada rekomendasi untuk {title}. Catat makanan Anda agar rekomendasi menjadi lebih baik.</div>
              ) : (
               foods.map((food) => (
  <div
    key={`${key}-${food.id}`}
    style={{
      background: `linear-gradient(
        180deg,
        ${accentColorFor(key)}10,
        #ffffff 60%
      )`,
      borderRadius: 18,
      padding: 18,
      marginBottom: 16,
      boxShadow: '0 12px 28px rgba(15,23,42,0.08)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      border: `1px solid ${accentColorFor(key)}22`,
      position: 'relative'
    }}
  >


              <div style={C.left}>
  {/* ICON */}
  <div
    style={{
      width: 42,
      height: 42,
      borderRadius: 12,
      background: `${accentColorFor(key)}22`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 20,
      flexShrink: 0
    }}
  >
    {key === 'sarapan' ? '🍳' :
     key === 'makan_siang' ? '🍽️' :
     key === 'makan_malam' ? '🌙' : '🍪'}
  </div>

  {/* CONTENT */}
  <div>
    <div style={{ fontSize: 16, fontWeight: 800 }}>
      {food.name}
    </div>

    <div style={{ fontSize: 13, color: brand.muted, marginTop: 4 }}>
    {food.reason?.length > 0 && (
  <ul style={{
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
    paddingLeft: 18
  }}>
    {food.reason.map((r, i) => (
      <li key={i}>✅ {r}</li>
    ))}
  </ul>
)}

      Protein <b>{Math.round(food.protein)}g</b> •
      Karbo <b>{Math.round(food.carbs)}g</b> •
      Lemak <b>{Math.round(food.fat)}g</b>
    </div>

    {food.recipe && (
      <button
        onClick={() =>
          setOpenRecipe({
            name: food.name,
            recipe: food.recipe,
            kalori: food.kalori,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
            mealKey: key
          })
        }
        style={{
          marginTop: 10,
          background: brand.purple,
          color: '#fff',
          border: 'none',
          padding: '8px 14px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        🔍 Detail Resep
      </button>
    )}
  </div>
</div>


<div style={C.right}>
  <div
    style={{
      background: `${accentColorFor(key)}22`,
      color: accentColorFor(key),
      padding: '8px 14px',
      borderRadius: 999,
      fontWeight: 900,
      fontSize: 14
    }}
  >
    {fmt(Math.round(food.kalori))} kcal
  </div>
</div>



                  </div>
                ))
              )}
            </section>
          )
        })}
      </div>

      <div style={{ marginTop: 18, textAlign: 'center', color: brand.muted, fontSize: 13 }}>
        Tips: Catat makanan yang Anda makan agar rekomendasi semakin akurat dan personal.
      </div>

      <RecipeModal open={!!openRecipe} data={openRecipe} onClose={() => setOpenRecipe(null)} />
    </div>
  )
}

function PrefChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 800,
        border: '1px solid rgba(15,23,42,0.15)',
        background: active ? '#0f172a' : '#ffffff',
        color: active ? '#ffffff' : '#0f172a',
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  )
}
