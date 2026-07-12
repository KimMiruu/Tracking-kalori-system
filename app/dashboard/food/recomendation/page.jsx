// app/page.jsx
'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'

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

function fmt(n) {
  if (typeof n !== 'number') return n
  return n.toLocaleString('id-ID')
}

function sumMacros(foods = []) {
  return foods.reduce(
    (acc, f) => {
      acc.kalori += Number(f.kalori || 0);
      acc.protein += Number(f.protein || 0);
      acc.carbs += Number(f.carbs || 0);
      acc.fat += Number(f.fat || 0);
      return acc;
    },
    { kalori: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/* style tokens — glassmorphism theme */
const glass = {
  card: 'rgba(255,255,255,0.75)',
  cardHover: 'rgba(255,255,255,0.92)',
  border: 'rgba(36,123,160,0.12)',
  borderAlt: 'rgba(36,123,160,0.18)',
  blur: 'blur(16px)',
  shadow: '0 8px 32px rgba(15,23,42,0.08)',
  shadowLg: '0 20px 60px rgba(15,23,42,0.12)',
}

const brand = {
  purple: '#247ba0',
  teal: '#70c1b3',
  orange: '#fb923c',
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  muted: '#64748b',
}

const accent = {
  sarapan: brand.orange,
  makan_siang: brand.green,
  makan_malam: brand.purple,
  camilan: brand.red
}

const C = {
  page: {
    maxWidth: 1150,
    margin: '0 auto',
    padding: '120px 20px 80px',
    minHeight: '100vh',
  },

  statCard: {
    background: glass.card,
    backdropFilter: glass.blur,
    WebkitBackdropFilter: glass.blur,
    borderRadius: 20,
    padding: '20px 22px',
    border: `1px solid ${glass.border}`,
    boxShadow: glass.shadow,
    transition: 'all 0.3s ease',
  },

  statLabel: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 900,
    lineHeight: 1,
  },

  meals: { marginTop: 32 },

  mealCard: {
    background: glass.card,
    backdropFilter: glass.blur,
    WebkitBackdropFilter: glass.blur,
    borderRadius: 20,
    padding: 18,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
    boxShadow: glass.shadow,
    marginBottom: 14,
    border: `1px solid ${glass.border}`,
    transition: 'all 0.25s ease',
  },

  left: { display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 },
  name: { fontWeight: 800, fontSize: 15, color: '#0f172a', lineHeight: 1.3 },
  meta: { color: brand.muted, fontSize: 12, marginTop: 4 },
  right: { textAlign: 'right', minWidth: 110, flexShrink: 0 },
}

/* skeleton */
const Skeleton = ({ width = '70%' }) => (
  <div style={{ height: 12, width, background: 'rgba(255,255,255,0.4)', borderRadius: 6 }} />
)

/* -------- sub-components -------- */

function BundleSection({ bundles, onSelectBundle, onOpenRecipe, loadingId, accentColorFor }) {
  if (!bundles || bundles.length === 0) return null

  const mealIcons = { sarapan: '🍳', makan_siang: '🍽️', makan_malam: '🌙', camilan: '🍪' }

  const totalMacros = { calories: 0, protein: 0, carbs: 0, fat: 0 }
  bundles.forEach(b => {
    totalMacros.calories += b.totalCalories
    totalMacros.protein += b.totalProtein
    totalMacros.carbs += b.totalCarbs
    totalMacros.fat += b.totalFat
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      style={{ marginBottom: 40 }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 16,
          background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, boxShadow: '0 10px 28px rgba(36,123,160,0.3)',
        }}>
          📦
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: 19, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.2px' }}>
            Paket Harian
          </h2>
          <p style={{ margin: 0, fontSize: 12, color: brand.muted }}>
            Pilih satu paket lengkap — klik makanan untuk lihat detail resep
          </p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: 20,
      }}>
        {bundles.map((bundle, idx) => (
          <motion.div
            key={bundle.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.12 }}
            whileHover={{ y: -5, boxShadow: '0 24px 56px rgba(15,23,42,0.16)' }}
            style={{
              borderRadius: 24,
              border: `1px solid ${glass.border}`,
              boxShadow: '0 8px 32px rgba(15,23,42,0.08)',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* card top gradient strip */}
            <div style={{
              background: 'linear-gradient(135deg, #247ba0, #70c1b3)',
              padding: '20px 24px',
              color: '#fff',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -25, right: -20,
                width: 100, height: 100, borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
              }} />
              <div style={{
                position: 'absolute', bottom: -30, left: '50%',
                width: 80, height: 80, borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
              }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '2px', opacity: 0.85, marginBottom: 6,
                }}>
                  📋 Paket {idx + 1}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1 }}>
                      {fmt(bundle.totalCalories)}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>total kcal</div>
                  </div>
                  <button
                    onClick={() => onSelectBundle(bundle)}
                    disabled={loadingId != null}
                    style={{
                      background: 'rgba(255,255,255,0.22)',
                      backdropFilter: 'blur(8px)',
                      color: '#fff', border: '1px solid rgba(255,255,255,0.35)',
                      borderRadius: 14, padding: '11px 22px',
                      fontWeight: 800, fontSize: 14,
                      cursor: loadingId != null ? 'not-allowed' : 'pointer',
                      opacity: loadingId === bundle.id ? 0.5 : 1,
                      transition: 'all 0.2s',
                      whiteSpace: 'nowrap',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {loadingId === bundle.id ? 'Menambah...' : 'Pilih Paket'}
                  </button>
                </div>
              </div>
            </div>

            {/* card body */}
            <div style={{
              background: glass.card,
              backdropFilter: glass.blur,
              WebkitBackdropFilter: glass.blur,
              padding: '18px 22px 22px',
            }}>
              {/* macro pills */}
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18,
              }}>
                {[
                  { label: 'Protein', val: bundle.totalProtein, unit: 'g', icon: '🥩', bg: 'rgba(16,185,129,0.1)', color: '#065f46', barColor: '#10b981' },
                  { label: 'Karbo', val: bundle.totalCarbs, unit: 'g', icon: '🍚', bg: 'rgba(251,146,60,0.1)', color: '#9a3412', barColor: '#fb923c' },
                  { label: 'Lemak', val: bundle.totalFat, unit: 'g', icon: '🧈', bg: 'rgba(239,68,68,0.08)', color: '#991b1b', barColor: '#ef4444' },
                ].map(m => (
                  <div key={m.label} style={{
                    flex: 1, minWidth: 90,
                    padding: '10px 12px', borderRadius: 14,
                    background: m.bg, border: `1px solid ${m.color}18`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: m.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {m.icon} {m.label}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: m.color, lineHeight: 1 }}>
                      {m.val}<span style={{ fontSize: 11, fontWeight: 600 }}> {m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* advantages */}
              {bundle.advantages && bundle.advantages.length > 0 && (
                <div style={{
                  display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16,
                }}>
                  {bundle.advantages.map((adv, ai) => (
                    <span key={ai} style={{
                      padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700,
                      background: `${adv.color}16`, color: adv.color,
                      border: `1px solid ${adv.color}30`, letterSpacing: '0.2px',
                    }}>
                      {adv.label}
                    </span>
                  ))}
                </div>
              )}

              {/* meal list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {bundle.meals.map((meal, mi) => (
                  <motion.div
                    key={mi}
                    whileHover={{ x: 4, background: `${accentColorFor(meal.mealType)}18` }}
                    onClick={() => {
                      if (meal.recipe) {
                        onOpenRecipe({
                          name: meal.name, recipe: meal.recipe,
                          kalori: meal.kalori, protein: meal.protein,
                          carbs: meal.carbs, fat: meal.fat,
                          mealKey: meal.mealType,
                        })
                      }
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '12px 14px', borderRadius: 14,
                      background: `${accentColorFor(meal.mealType)}0A`,
                      border: `1px solid ${accentColorFor(meal.mealType)}18`,
                      cursor: meal.recipe ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      borderLeft: `4px solid ${accentColorFor(meal.mealType)}`,
                    }}
                  >
                    <div style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: accentColorFor(meal.mealType),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 15, flexShrink: 0,
                      boxShadow: `0 4px 12px ${accentColorFor(meal.mealType)}40`,
                    }}>
                      {mealIcons[meal.mealType] || '🍽️'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11, fontWeight: 700, color: accentColorFor(meal.mealType),
                        textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2,
                      }}>
                        {meal.mealTitle}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {meal.name}
                      </div>
                      {meal.recipe && (
                        <div style={{ fontSize: 11, color: brand.muted, marginTop: 2 }}>
                          🔍 Klik untuk lihat resep
                        </div>
                      )}
                    </div>
                    <div style={{
                      fontSize: 13, fontWeight: 900, color: accentColorFor(meal.mealType),
                      background: `${accentColorFor(meal.mealType)}14`,
                      padding: '6px 12px', borderRadius: 999, flexShrink: 0,
                    }}>
                      {Math.round(meal.kalori)} kcal
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

function RecipeModal({ open, data, onClose, onAdd }) {
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
    padding: '14px 14px',
    borderRadius: 16,
    background: bg,
    color,
    boxShadow: '0 6px 18px rgba(0,0,0,0.06)'
  })

  if (typeof document === 'undefined') return null

  const modal = (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15,23,42,0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
    }}>
      <div style={{
        width: 'min(900px,96%)', maxHeight: '90vh', overflow: 'auto',
        background: 'linear-gradient(180deg,#ffffff,#f8fafc)',
        borderRadius: 24, padding: 28,
        boxShadow: '0 30px 80px rgba(15,23,42,0.35)',
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
          padding: '22px 24px', borderRadius: 18, color: '#fff', marginBottom: 20,
        }}>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{data.name}</h3>
          <div style={{ fontSize: 13, opacity: 0.9, marginTop: 6 }}>
            ⏱ {recipe.cook_time_min ?? '—'} menit &nbsp;•&nbsp; 🍽 {recipe.servings ?? 1} porsi
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
          <div style={macroCard('#ecfeff', '#0f766e')}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Kalori</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{fmt(macros.kalori)} kcal</div>
          </div>
          <div style={macroCard('#f0fdf4', '#166534')}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Protein</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{macros.protein} g</div>
          </div>
          <div style={macroCard('#fff7ed', '#9a3412')}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Karbo</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{macros.carbs} g</div>
          </div>
          <div style={macroCard('#fef2f2', '#991b1b')}>
            <div style={{ fontSize: 11, fontWeight: 600 }}>Lemak</div>
            <div style={{ fontWeight: 900, fontSize: 16 }}>{macros.fat} g</div>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: 18, borderRadius: 16, border: '1px solid rgba(15,23,42,0.06)', marginBottom: 16 }}>
          <h4 style={{ marginBottom: 10, fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            🧺 Bahan
          </h4>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.9, color: '#334155' }}>
            {ingredients.map((ing, i) => (
              <li key={i} style={{ marginBottom: 6 }}>{ing}</li>
            ))}
          </ul>
        </div>

        <div style={{ background: '#ffffff', padding: 18, borderRadius: 16, border: '1px solid rgba(15,23,42,0.06)', marginBottom: 20 }}>
          <h4 style={{ marginBottom: 10, fontSize: 15, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            👨‍🍳 Langkah
          </h4>
          <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 2, color: '#334155' }}>
            {steps.map((s, i) => (
              <li key={i} style={{ marginBottom: 8 }}>{s}</li>
            ))}
          </ol>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          {onAdd && (
            <button
              onClick={() => { onAdd(data); onClose() }}
              style={{
                background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
                color: '#fff', border: 'none', borderRadius: 14,
                padding: '12px 22px', fontWeight: 800, fontSize: 13, cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(36,123,160,0.35)',
              }}
            >
              + Tambah ke Tracking
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: '#fff', border: '1px solid rgba(15,23,42,0.08)',
              padding: '12px 20px', borderRadius: 14, cursor: 'pointer',
              fontWeight: 700, fontSize: 13,
            }}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

function EmptyRecommendationModal({ open, onClose }) {
  if (!open) return null
  if (typeof document === 'undefined') return null

  const modal = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.55)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 99999,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: 30 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        style={{
          width: 'min(440px, 92%)',
          background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
          borderRadius: 24,
          padding: '40px 32px',
          textAlign: 'center',
          boxShadow: '0 30px 80px rgba(15,23,42,0.4)',
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fef3c7, #f59e0b)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 34, margin: '0 auto 22px',
          boxShadow: '0 14px 36px rgba(245,158,11,0.35)',
        }}>
          🎉
        </div>
        <h3 style={{
          margin: '0 0 12px', fontSize: 20, fontWeight: 900,
          color: '#0f172a', letterSpacing: '-0.3px',
        }}>
          Rekomendasi Habis!
        </h3>
        <p style={{
          margin: '0 0 28px', fontSize: 14, color: '#475569',
          lineHeight: 1.7,
        }}>
          Wah, rekomendasi hari ini sudah habis!<br />
          Semua menu sudah kamu catat. Kembali besok ya~
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
            color: '#fff', border: 'none', borderRadius: 14,
            padding: '13px 40px', fontWeight: 800, fontSize: 14,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(36,123,160,0.35)',
          }}
        >
          Oke, Siap!
        </button>
      </motion.div>
    </motion.div>
  )

  return createPortal(modal, document.body)
}

function PrefChip({ active, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 800,
        border: active ? 'none' : '1px solid rgba(15,23,42,0.12)',
        background: active ? 'linear-gradient(135deg, #70c1b3, #247ba0)' : glass.card,
        backdropFilter: active ? 'none' : glass.blur,
        color: active ? '#fff' : '#0f172a',
        cursor: 'pointer',
        boxShadow: active ? '0 6px 20px rgba(36,123,160,0.35)' : 'none',
        transition: 'all 0.25s',
      }}
    >
      {label}
    </button>
  )
}

/* ================================================
   MAIN COMPONENT
   ================================================ */
export default function FoodRecommendationPage() {

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

  useEffect(() => {
    const saved = localStorage.getItem("usedFoodIds");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        usedFoodIdsRef.current = new Set(arr);
      } catch {}
    }
  }, []);

  /* FETCH SISA KALORI */
  const fetchKaloriDikonsumsi = async (userId, email) => {
    try {
      const tanggal = new Date().toISOString().slice(0, 10)
      const query = userId
        ? `userId=${userId}&tanggal=${tanggal}`
        : `email=${encodeURIComponent(email)}&tanggal=${tanggal}`
      const res = await fetch(`/api/tracking?${query}`)
      if (!res.ok) return 0
      const data = await res.json()
      if (!data?.detail_makanan) return 0
      const meals = JSON.parse(data.detail_makanan)
      return meals.reduce((total, meal) => {
        const foods = meal.foods || []
        return total + foods.reduce((sum, food) => sum + Number(food.calories || 0), 0)
      }, 0)
    } catch (err) {
      console.error('fetchKaloriDikonsumsi error:', err)
      return 0
    }
  }

  const fetchSisaKalori = async () => {
    try {
      setLoadingKalori(true)
      const raw = localStorage.getItem('userData') ?? localStorage.getItem('user')
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
      if (!res.ok) throw new Error('Tracking kosong')
      const tracking = await res.json()
      if (!tracking) throw new Error('Tracking kosong')
      const targetKalori =
        Number(
          tracking?.target_kalori ??
          tracking?.targetKalori ??
          localStorage.getItem(`targetKalori_${userId}`) ??
          localStorage.getItem(`targetKalori_${email}`)
        ) || 0
      const dikonsumsi = await fetchKaloriDikonsumsi(userId, email)
      const dibakar = Number(tracking.kalori_dibakar ?? 0)
      const sisa = targetKalori - dikonsumsi + dibakar
      setKaloriSummary({ targetKalori, dikonsumsi, dibakar })
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
  const [addingBundleId, setAddingBundleId] = useState(null);
  const [showEmptyPopup, setShowEmptyPopup] = useState(false);

  const LOW_BUDGET_THRESHOLD = 300;
  const isLowBudget =
    typeof sisaKalori === 'number' && sisaKalori <= LOW_BUDGET_THRESHOLD;

  const kaloriTarget = kaloriSummary?.targetKalori || 0;
  const kaloriDikonsumsi = kaloriSummary?.dikonsumsi || 0;
  const kaloriPercent =
    kaloriTarget > 0 ? Math.min(100, (kaloriDikonsumsi / kaloriTarget) * 100) : 0;

  async function addSingleToTracking(user, id_user, email, tanggal, food, mealKey) {
    const qs = id_user
      ? `id_user=${id_user}&tanggal=${tanggal}`
      : `email=${encodeURIComponent(email)}&tanggal=${tanggal}`
    const existingRes = await fetch(`/api/tracking?${qs}`)
    const existing = existingRes.ok ? await existingRes.json() : {}

    let meals = []
    if (existing?.detail_makanan) {
      try { meals = JSON.parse(existing.detail_makanan) || [] } catch {}
    }

    let meal = meals.find(m => m.mealKey === mealKey)
    if (!meal) {
      meal = { mealKey, foods: [] }
      meals.push(meal)
    }

    meal.foods.push({
      name: food.name,
      calories: Math.round(food.kalori || 0),
      protein: Math.round(food.protein || 0),
      carbs: Math.round(food.carbs || 0),
      fat: Math.round(food.fat || 0)
    })

    const payload = { id_user, email, tanggal, meals }
    const res = await fetch('/api/tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || 'Gagal menyimpan tracking')
    }
    const data = await res.json()

    const foodId = food.id !== undefined ? food.id : food.name
    usedFoodIdsRef.current.add(Number(foodId) || foodId)
  }

  async function handleAddToTracking(food) {
    try {
      const raw = localStorage.getItem('userData') ?? localStorage.getItem('user')
      if (!raw) return alert('User belum login')
      const parsed = JSON.parse(raw)
      const user = parsed.user || parsed.data || parsed
      const id_user = user.id_user || user.id || user.userId
      const email = user.email
      if (!id_user && !email) return alert('User tidak valid')
      const tanggal = new Date().toISOString().slice(0, 10)

      await addSingleToTracking(user, id_user, email, tanggal, food, food.mealKey)

      localStorage.setItem("usedFoodIds", JSON.stringify(Array.from(usedFoodIdsRef.current)))
      window.dispatchEvent(new Event('tracking-updated'))
      alert('✅ Ditambahkan & dikalkulasi')
      setOpenRecipe(null)
      await fetchSisaKalori()
    } catch (err) {
      console.error(err)
      alert('❌ Gagal menambahkan tracking')
    }
  }

  async function handleAddBundleToTracking(bundle) {
    try {
      setAddingBundleId(bundle.id)
      const raw = localStorage.getItem('userData') ?? localStorage.getItem('user')
      if (!raw) return alert('User belum login')
      const parsed = JSON.parse(raw)
      const user = parsed.user || parsed.data || parsed
      const id_user = user.id_user || user.id || user.userId
      const email = user.email
      if (!id_user && !email) return alert('User tidak valid')
      const tanggal = new Date().toISOString().slice(0, 10)

      for (const meal of bundle.meals) {
        await addSingleToTracking(user, id_user, email, tanggal, meal, meal.mealType)
      }

      localStorage.setItem("usedFoodIds", JSON.stringify(Array.from(usedFoodIdsRef.current)))
      window.dispatchEvent(new Event('tracking-updated'))
      alert('✅ Paket berhasil ditambahkan ke tracking!')
      await fetchSisaKalori()
    } catch (err) {
      console.error(err)
      alert('❌ Gagal menambahkan paket')
    } finally {
      setAddingBundleId(null)
    }
  }

  /* FETCH SISA KALORI on mount */
  useEffect(() => { fetchSisaKalori() }, [])

  /* LOAD COOKED FOODS */
  useEffect(() => {
    let mounted = true
    async function loadCooked() {
      try {
        const res = await fetch(COOKED_JSON_URL)
        if (!res.ok) throw new Error('Gagal memuat cooked foods')
        const data = await res.json()
        const arr = normalizeCookedArray(Array.isArray(data) ? data : data.foods || [])
        if (mounted) { setCookedFoods(arr); setCombinedFoods(arr) }
      } catch (err) {
        console.error('Error loading cooked JSON', err)
        if (mounted) { setCookedFoods([]); setCombinedFoods([]) }
      }
    }
    loadCooked()
    return () => { mounted = false }
  }, [])

  const getRenderedFoodsForKey = (key) => {
    const srv = serverRecommendations?.[key]
    if (!srv || !Array.isArray(srv.foods)) return []
    return srv.foods.map((food) => ({
      id: food.id ?? food.name,
      name: food.name,
      kalori: food.kalori,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      recipe: food.recipe ?? null,
      reason: food.reason ?? [],
    }))
  }

  /* FETCH REKOMENDASI */
  useEffect(() => {
    const raw = localStorage.getItem('userData') ?? localStorage.getItem('user');
    if (!raw) return;
    const parsed = JSON.parse(raw);
    const user = parsed.user || parsed.data || parsed;
    const id = user.id_user || user.id || user.userId || null;
    setUserId(id);
  }, []);

  useEffect(() => {
    if (sisaKalori == null) return
    if (!Array.isArray(combinedFoods) || combinedFoods.length === 0) return

    const fetchRecommendations = async () => {
      try {
        setLoadingServerRec(true)
        setServerError(null)

        const mapping = {
          sarapan: { apiMeal: 'breakfast' },
          makan_siang: { apiMeal: 'lunch' },
          makan_malam: { apiMeal: 'dinner' },
          camilan: { apiMeal: 'snack' }
        }

        const nextServerRecs = {}
        const mealDivider = {
          sarapan: 0.3,
          makan_siang: 0.35,
          makan_malam: 0.25,
          camilan: 0.1
        };

        for (const key of Object.keys(mapping)) {
          const info = mapping[key];

          const res = await fetch('/api/recomendation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              sisaKalori: Math.round(sisaKalori * mealDivider[key]),
              meal: info.apiMeal,
              usedFoodIds: Array.from(usedFoodIdsRef.current),
              goal: goal,
              preferences: preferences
            })
          });

          const data = res.ok ? await res.json() : {};
          const list = Array.isArray(data?.recommendations) ? data.recommendations : [];
          list.forEach(item => {
            const id = item.id_makanan || item.id;
            if (id != null) { usedFoodIdsRef.current.add(Number(id)); }
          });

          nextServerRecs[key] = {
            foods: list,
            macroTarget: data.macroTarget,
            macroAchieved: data.macroAchieved
          };
        }

        setServerRecommendations(nextServerRecs)
        localStorage.setItem("usedFoodIds", JSON.stringify(Array.from(usedFoodIdsRef.current)));
      } catch (err) {
        console.error(err)
        setServerError(err.message || String(err))
      } finally {
        setLoadingServerRec(false)
      }
    }

    fetchRecommendations()
  }, [sisaKalori, combinedFoods, isLowBudget, goal, preferences])

  // Detect when all recommendations are exhausted
  useEffect(() => {
    if (loadingServerRec) return;
    if (serverRecommendations.sarapan === null) return;

    var allEmpty = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'].every(function (key) {
      var rec = serverRecommendations[key];
      return rec && Array.isArray(rec.foods) && rec.foods.length === 0;
    });
    if (allEmpty) {
      setShowEmptyPopup(true);
    }
  }, [serverRecommendations, loadingServerRec]);

  function accentColorFor(key) { return accent[key] ?? brand.purple }

  const macroPill = (bg, color) => ({
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 800,
    background: bg, color,
  })

  /* -------- bundle generation -------- */
  function generateBundles() {
    const meals = ['sarapan', 'makan_siang', 'makan_malam', 'camilan'];
    const titles = {
      sarapan: 'Sarapan', makan_siang: 'Makan Siang',
      makan_malam: 'Makan Malam', camilan: 'Camilan'
    };
    const foodsPerMeal = {};
    meals.forEach(m => {
      foodsPerMeal[m] = getRenderedFoodsForKey(m);
    });

    const maxAvailable = Math.max(1, ...meals.map(m => foodsPerMeal[m].length));
    if (maxAvailable === 0) return [];

    const bundleCount = Math.min(2, maxAvailable);
    const bundles = [];

    for (let i = 0; i < bundleCount; i++) {
      const bundleMeals = [];
      let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;

      meals.forEach(m => {
        const pool = foodsPerMeal[m];
        const food = pool.length > 0 ? pool[i % pool.length] : null;
        if (food) {
          bundleMeals.push({
            ...food,
            mealType: m,
            mealTitle: titles[m],
            mealKey: m,
          });
          totalCals += food.kalori || 0;
          totalProtein += food.protein || 0;
          totalCarbs += food.carbs || 0;
          totalFat += food.fat || 0;
        }
      });

      const rProtein = totalCals > 0 ? ((totalProtein * 4) / totalCals * 100) : 0;
      const rCarbs = totalCals > 0 ? ((totalCarbs * 4) / totalCals * 100) : 0;
      const rFat = totalCals > 0 ? ((totalFat * 9) / totalCals * 100) : 0;

      const advantages = [];
      if (totalProtein >= 40) advantages.push({ label: '💪 Tinggi Protein', color: brand.green });
      if (totalCals <= 1200) advantages.push({ label: '🍃 Rendah Kalori', color: brand.teal });
      if (rProtein >= 25 && rCarbs >= 30) advantages.push({ label: '⚖️ Gizi Seimbang', color: brand.purple });
      if (totalProtein >= 50 && totalFat <= 50) advantages.push({ label: '🏋️ Ideal Otot', color: brand.orange });
      if (totalCarbs >= 150) advantages.push({ label: '⚡ Tinggi Energi', color: '#f59e0b' });
      if (advantages.length === 0) advantages.push({ label: '✅ Menu Lengkap', color: brand.green });

      bundles.push({
        id: i,
        name: `Paket ${i + 1}`,
        meals: bundleMeals,
        totalCalories: Math.round(totalCals),
        totalProtein: Math.round(totalProtein),
        totalCarbs: Math.round(totalCarbs),
        totalFat: Math.round(totalFat),
        advantages,
      });
    }

    return bundles;
  }

  const bundles = generateBundles();

  /* ================================================
     RENDER
     ================================================ */
  return (
    <div style={{
      ...C.page,
      background: 'linear-gradient(180deg, #ecfdf5 0%, #f8fafc 30%, #f0fdf4 100%)',
      position: 'relative',
    }}>
      {/* ambient bg decoration */}
      <div style={{
        position: 'fixed', top: -200, right: -200,
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(36,123,160,0.06) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: -150, left: -150,
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(112,193,179,0.05) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            maxWidth: 780,
            paddingLeft: 18,
            borderLeft: '4px solid #247ba0',
            marginBottom: 32,
          }}
        >
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: 0, letterSpacing: '-0.4px', color: '#0f172a' }}>
            Rekomendasi Makanan
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: brand.muted }}>
            Disesuaikan dengan sisa kalori dan pola makan kamu hari ini
          </p>
        </motion.div>

        {/* CALORIE STATUS + CONTROLS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            background: glass.card,
            backdropFilter: glass.blur,
            WebkitBackdropFilter: glass.blur,
            borderRadius: 24,
            border: `1px solid ${glass.border}`,
            boxShadow: glass.shadowLg,
            overflow: 'hidden',
          }}>
            {/* ===== TOP STRIP: SISA KALORI ===== */}
            <div style={{
              background: 'linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)',
              padding: '28px 32px',
              color: '#fff',
              position: 'relative',
            }}>
              {/* subtle decoration */}
              <div style={{ position: 'absolute', right: -20, top: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', right: 100, bottom: -40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: 6 }}>
                    Sisa Kalori Hari Ini
                  </div>
                  <div style={{ fontSize: 52, fontWeight: 900, lineHeight: 1, letterSpacing: '-1px' }}>
                    {isKaloriReady ? fmt(sisaKalori) : '—'}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.8, marginTop: 4 }}>
                    kcal tersisa
                  </div>
                </div>

                {/* progress ring */}
                <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.85)"
                      strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 42) * (1 - kaloriPercent / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: 20, fontWeight: 900 }}>{Math.round(kaloriPercent)}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.7 }}>%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ===== BOTTOM SECTION: stats + progress + goal ===== */}
            <div style={{ padding: '24px 28px 20px' }}>
              {/* STATS GRID */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 14,
                marginBottom: 22,
              }}>
                {[
                  { label: 'Target', val: fmt(kaloriSummary?.targetKalori ?? 0), color: '#3b82f6', bg: 'rgba(59,130,246,0.06)', icon: '🎯' },
                  { label: 'Dikonsumsi', val: fmt(kaloriSummary?.dikonsumsi ?? 0), color: '#f97316', bg: 'rgba(249,115,22,0.06)', icon: '🍴' },
                  { label: 'Dibakar', val: fmt(kaloriSummary?.dibakar ?? 0), color: '#ef4444', bg: 'rgba(239,68,68,0.05)', icon: '🔥' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: s.bg,
                    borderRadius: 16,
                    padding: '14px 16px',
                    border: `1px solid ${s.color}15`,
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: brand.muted, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>
                      {s.icon} {s.label}
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color, lineHeight: 1 }}>
                      {s.val}
                    </div>
                    <div style={{ fontSize: 10, color: brand.muted, marginTop: 2 }}>kcal</div>
                  </div>
                ))}
              </div>

              {/* DIVIDER */}
              <div style={{ height: 1, background: 'rgba(15,23,42,0.05)', marginBottom: 20 }} />

              {/* PROGRESS BAR */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Progress Kalori</span>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#247ba0' }}>{Math.round(kaloriPercent)}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(15,23,42,0.05)', borderRadius: 999, overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${kaloriPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #70c1b3, #247ba0)' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ERROR */}
        {(errorKalori || serverError) && (
          <div style={{ marginBottom: 16, fontSize: 13, color: '#b91c1c', background: 'rgba(239,68,68,0.08)', padding: '12px 16px', borderRadius: 12 }}>
            {errorKalori || serverError}
          </div>
        )}

        {/* ============================================
            BUNDLE SECTION
            ============================================ */}
        {!loadingServerRec && (
          <BundleSection
            bundles={bundles}
            onSelectBundle={handleAddBundleToTracking}
            onOpenRecipe={setOpenRecipe}
            loadingId={addingBundleId}
            accentColorFor={accentColorFor}
          />
        )}

        {/* SECTION: rekomendasi + filter (goal & waktu) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ marginBottom: 28 }}
        >
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: '1px solid rgba(15,23,42,0.06)',
            boxShadow: '0 4px 24px rgba(15,23,42,0.05)',
            padding: '24px 28px',
          }}>
            <h2 style={{
              fontSize: 18, fontWeight: 900, color: '#0f172a',
              margin: '0 0 4px 0', letterSpacing: '-0.2px',
            }}>
              Pilih Menu Makanan
            </h2>
            <p style={{ fontSize: 13, color: brand.muted, margin: '0 0 22px 0', lineHeight: 1.5 }}>
              Silahkan pilih menu makanan yang sesuai dengan kebutuhan kalori dan tujuanmu
            </p>

            {/* grid: goal kiri | waktu kanan */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
              alignItems: 'start',
            }}>
              {/* goal */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(245,158,11,0.04) 0%, transparent 100%)',
                borderRadius: 16, padding: '16px 18px',
                borderLeft: '4px solid #f59e0b',
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🎯 Tujuan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'lose_weight', label: '🔥 Turun Berat', desc: 'Defisit kalori, tinggi protein' },
                    { key: 'build_muscle', label: '💪 Naik Otot', desc: 'Surplus kalori, protein prioritas' },
                    { key: 'maintain', label: '⚖️ Jaga Berat', desc: 'Gizi seimbang, berat stabil' },
                  ].map(opt => {
                    const active = goal === opt.key
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setGoal(opt.key)}
                        style={{
                          textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          border: active ? 'none' : '1px solid rgba(15,23,42,0.06)',
                          background: active ? 'linear-gradient(135deg, #f59e0b, #d97706)' : '#fafafa',
                          color: active ? '#fff' : '#334155',
                          boxShadow: active ? '0 4px 14px rgba(245,158,11,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{opt.label}</div>
                        <div style={{ fontSize: 11, opacity: active ? 0.85 : 0.5, marginTop: 2 }}>{opt.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* waktu */}
              <div style={{
                background: 'linear-gradient(180deg, rgba(16,185,129,0.04) 0%, transparent 100%)',
                borderRadius: 16, padding: '16px 18px',
                borderLeft: '4px solid #10b981',
              }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  🍽️ Waktu Makan
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { key: 'all', label: '🍛 Semua Waktu', desc: 'Tampilkan semua rekomendasi' },
                    { key: 'sarapan', label: '🍳 Sarapan', desc: 'Menu pagi, energi awal hari' },
                    { key: 'makan_siang', label: '🍽️ Makan Siang', desc: 'Menu siang, isi tenaga' },
                    { key: 'makan_malam', label: '🌙 Makan Malam', desc: 'Menu malam, ringan & bernutrisi' },
                    { key: 'camilan', label: '🍪 Camilan', desc: 'Selingan sehat rendah kalori' },
                  ].map(item => {
                    const active = activeMealFilter === item.key
                    return (
                      <button
                        key={item.key}
                        onClick={() => setActiveMealFilter(item.key)}
                        style={{
                          textAlign: 'left', padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                          border: active ? 'none' : '1px solid rgba(15,23,42,0.06)',
                          background: active ? 'linear-gradient(135deg, #70c1b3, #247ba0)' : '#fafafa',
                          color: active ? '#fff' : '#334155',
                          boxShadow: active ? '0 4px 14px rgba(36,123,160,0.3)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontSize: 13, fontWeight: 800 }}>{item.label}</div>
                        <div style={{ fontSize: 11, opacity: active ? 0.85 : 0.5, marginTop: 2 }}>{item.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* MEAL SECTIONS */}
        <div style={C.meals}>
          <AnimatePresence mode="wait">
            {['sarapan', 'makan_siang', 'makan_malam', 'camilan']
              .filter(key => {
                if (activeMealFilter === 'all') return !isLowBudget || key === 'camilan'
                return key === activeMealFilter
              }).map((key, sectionIdx) => {
                const foods = getRenderedFoodsForKey(key)
                const mealData = serverRecommendations?.[key]
                const macros = mealData?.macroAchieved || sumMacros(foods);
                const title = key === 'sarapan' ? 'Sarapan' : key === 'makan_siang' ? 'Makan Siang' : key === 'makan_malam' ? 'Makan Malam' : 'Camilan'

                return (
                  <motion.section
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: sectionIdx * 0.05 }}
                    style={{ marginBottom: 48 }}
                  >
                    {/* SECTION PILL HEADER */}
                    <div style={{ position: 'relative', marginBottom: 28 }}>
                      <div style={{
                        position: 'absolute', left: 18, top: 50, bottom: -20,
                        width: 2, background: `${accentColorFor(key)}18`,
                      }} />
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 14,
                        padding: '14px 26px', borderRadius: 999,
                        background: glass.card, backdropFilter: glass.blur, WebkitBackdropFilter: glass.blur,
                        boxShadow: glass.shadowLg, border: `1px solid ${glass.border}`,
                        position: 'relative', zIndex: 2,
                      }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: '50%',
                          background: `linear-gradient(135deg, ${accentColorFor(key)}, ${accentColorFor(key)}cc)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 18, boxShadow: `0 8px 20px ${accentColorFor(key)}40`,
                        }}>
                          {key === 'sarapan' ? '🍳' : key === 'makan_siang' ? '🍽️' : key === 'makan_malam' ? '🌙' : '🍪'}
                        </div>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 900, letterSpacing: '0.4px', textTransform: 'uppercase', color: '#0f172a' }}>
                            {title}
                          </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            <div style={macroPill('rgba(112,193,179,0.1)', '#0f766e')}>🔥 {Math.round(macros.kalori)} kcal</div>
                            <div style={macroPill('rgba(16,185,129,0.1)', '#166534')}>🥩 {Math.round(macros.protein)}g</div>
                            <div style={macroPill('rgba(251,146,60,0.1)', '#9a3412')}>🍚 {Math.round(macros.carbs)}g</div>
                            <div style={macroPill('rgba(239,68,68,0.08)', '#991b1b')}>🧈 {Math.round(macros.fat)}g</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {mealData?.macroTarget && (
                      <div style={{
                        fontSize: 12, marginBottom: 16, padding: '10px 16px',
                        background: 'rgba(241,245,249,0.7)', borderRadius: 10,
                        color: '#334155', border: `1px solid ${glass.border}`,
                      }}>
                        Target Makro Meal: Protein {Math.round(mealData.macroTarget.protein)}g • Karbo {Math.round(mealData.macroTarget.carbs)}g • Lemak {Math.round(mealData.macroTarget.fats)}g
                      </div>
                    )}

                    {loadingServerRec ? (
                      [...Array(2)].map((_, i) => (
                        <div key={i} style={{ ...C.mealCard, opacity: 0.7 }}>
                          <div style={C.left}>
                            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${accentColorFor(key)}18`, flexShrink: 0 }} />
                            <div>
                              <Skeleton width="220px" />
                              <div style={{ marginTop: 8 }}><Skeleton width="150px" /></div>
                            </div>
                          </div>
                          <div style={C.right}><Skeleton width="70px" /></div>
                        </div>
                      ))
                    ) : !foods || foods.length === 0 ? (
                      <div style={{ ...C.statCard, textAlign: 'center', color: brand.muted, padding: '28px 20px' }}>
                        Belum ada rekomendasi untuk {title}. Catat makanan Anda agar rekomendasi menjadi lebih baik.
                      </div>
                    ) : (
                      foods.map((food, fi) => (
                        <motion.div
                          key={`${key}-${food.name}-${food.kalori}`}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: fi * 0.06 }}
                          whileHover={{
                            y: -3,
                            background: glass.cardHover,
                            boxShadow: '0 16px 40px rgba(15,23,42,0.12)',
                          }}
                          style={{
                            ...C.mealCard,
                            borderLeft: `5px solid ${accentColorFor(key)}`,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* subtle bg glow */}
                          <div style={{
                            position: 'absolute', top: -20, right: -20,
                            width: 80, height: 80, borderRadius: '50%',
                            background: `${accentColorFor(key)}08`,
                            pointerEvents: 'none',
                          }} />

                          <div style={C.left}>
                            <div style={{
                              width: 44, height: 44, borderRadius: 14,
                              background: `${accentColorFor(key)}14`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 20, flexShrink: 0, position: 'relative', zIndex: 1,
                            }}>
                              {key === 'sarapan' ? '🍳' : key === 'makan_siang' ? '🍽️' : key === 'makan_malam' ? '🌙' : '🍪'}
                            </div>
      <div style={{ position: 'relative' }}>
                              <div style={C.name}>{food.name}</div>
                              <div style={C.meta}>
                                Protein <b>{Math.round(food.protein)}g</b> • Karbo <b>{Math.round(food.carbs)}g</b> • Lemak <b>{Math.round(food.fat)}g</b>
                              </div>
                              {food.reason?.length > 0 && (
                                <ul style={{ marginTop: 6, fontSize: 11, color: '#475569', paddingLeft: 16 }}>
                                  {food.reason.map((r, ri) => <li key={ri}>✅ {r}</li>)}
                                </ul>
                              )}
                              {food.recipe && (
                                <button
                                  onClick={() =>
                                    setOpenRecipe({
                                      name: food.name, recipe: food.recipe,
                                      kalori: food.kalori, protein: food.protein,
                                      carbs: food.carbs, fat: food.fat,
                                      mealKey: key
                                    })
                                  }
                                  style={{
                                    marginTop: 10, background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
                                    color: '#fff', border: 'none', padding: '8px 16px',
                                    borderRadius: 999, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                    boxShadow: '0 6px 18px rgba(36,123,160,0.3)',
                                  }}
                                >
                                  🔍 Detail Resep
                                </button>
                              )}
                            </div>
                          </div>

                          <div style={{ ...C.right, position: 'relative', zIndex: 1 }}>
                            <div style={{
                              background: `${accentColorFor(key)}14`,
                              color: accentColorFor(key),
                              padding: '10px 16px', borderRadius: 999,
                              fontWeight: 900, fontSize: 15,
                            }}>
                              {fmt(Math.round(food.kalori))} kcal
                            </div>
                            <button
                              onClick={() => handleAddToTracking({ ...food, mealKey: key })}
                              style={{
                                marginTop: 8, background: 'transparent', border: `1px solid ${accentColorFor(key)}30`,
                                color: accentColorFor(key), padding: '6px 14px', borderRadius: 999,
                                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
                              }}
                            >
                              + Tambah
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.section>
                )
              })}
          </AnimatePresence>
        </div>

        {/* FOOTER TIPS */}
        <div style={{ marginTop: 32, textAlign: 'center', color: brand.muted, fontSize: 13 }}>
          Tips: Catat makanan yang Anda makan agar rekomendasi semakin akurat dan personal.
        </div>

        <RecipeModal open={!!openRecipe} data={openRecipe} onClose={() => setOpenRecipe(null)} onAdd={handleAddToTracking} />
        <AnimatePresence>
          {showEmptyPopup && (
            <EmptyRecommendationModal
              open={showEmptyPopup}
              onClose={() => setShowEmptyPopup(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
