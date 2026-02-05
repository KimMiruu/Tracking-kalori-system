'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

/* ------------------------- DEFAULT (mock) DATA ------------------------- */
const defaultDailyGoals = {
  calories: 2000,
  protein: 120,
  carbs: 250,
  fat: 65,
  water: 2000
}

const defaultTodayData = {
  calories: {
    consumed: 0,
    burned: 0
  },
  macros: {
    protein: { consumed: 0, goal: defaultDailyGoals.protein },
    carbs: { consumed: 0, goal: defaultDailyGoals.carbs },
    fat: { consumed: 0, goal: defaultDailyGoals.fat }
  },
  meals: [],
  exercises: []
}

const macroEducationLinks = {
  carbs: {
    title: 'Karbohidrat Berlebih',
    desc: 'Konsumsi karbohidrat berlebihan dapat meningkatkan kadar gula darah dan berisiko menyebabkan penambahan berat badan.',
    url: 'https://www.alodokter.com/kelebihan-karbohidrat-ketahui-8-dampaknya-untuk-kesehatan-tubuh'
  },
  fat: {
    title: 'Lemak Berlebih',
    desc: 'Asupan lemak yang berlebihan, terutama lemak jenuh, dapat meningkatkan risiko obesitas dan penyakit jantung.',
    url: 'https://hellosehat.com/nutrisi/fakta-gizi/dampak-kelebihan-lemak/'
  }
}

/* =========================
   UTIL: toNumberSafe
   ========================= */

function toNumberSafe (value, fallback = 0) {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/* =========================
   STYLES (Enhanced UI)
   ========================= */
// ... styles unchanged (same as user) ...
const styles = {
  container: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  nav: {
    /* ... */
  },
  navScrolled: {
    /* ... */
  },
  navContent: {
    /* ... */
  },
  logoSection: {
    /* ... */
  },
  logo: {
    /* ... */
  },
  logoImageContainer: {
    /* ... */
  },
  logoImage: {
    /* ... */
  },
  logoText: {
    /* ... */
  },
  menuSection: {
    /* ... */
  },
  menuLink: {
    /* ... */
  },
  activeMenuLink: {
    /* ... */
  },
  menuIcon: {
    /* ... */
  },
  profileSection: {
    /* ... */
  },
  timeDisplay: {
    /* ... */
  },
  timeText: {
    /* ... */
  },
  profileDropdown: {
    /* ... */
  },
  profileButton: {
    /* ... */
  },
  profileAvatar: {
    /* ... */
  },
  avatarText: {
    /* ... */
  },
  profileName: {
    /* ... */
  },
  dropdownArrow: {
    /* ... */
  },
  dropdownMenu: {
    /* ... */
  },
  dropdownItem: {
    /* ... */
  },
  mainContent: {
    marginTop: '80px',
    minHeight: 'calc(100vh - 80px)',
    padding: '2rem 1rem'
  },
  contentContainer: { maxWidth: '1200px', margin: '0 auto' },
  headerSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2.5rem'
  },
  headerText: { flex: 1 },
  pageTitle: {
    fontSize: '2.75rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  pageSubtitle: { fontSize: '1.125rem', color: '#64748b', fontWeight: '500' },
  dateSection: { flex: '0 0 auto' },
  dateDisplay: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '1rem 1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)'
  },
  dateText: { fontSize: '0.875rem', fontWeight: '600', color: '#475569' },
  statsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
    marginBottom: '2.5rem'
  },
  calorieCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  calorieHeader: { flex: 1 },
  calorieTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1.5rem'
  },
  calorieStats: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  calorieStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  calorieConsumed: { color: '#475569' },
  calorieBurned: { color: '#ef4444' },
  calorieRemaining: { fontWeight: '600' },
  waterCard: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: 'relative',
    overflow: 'hidden'
  },
  waterHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  waterTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
  waterAmount: { fontSize: '0.9rem', color: '#64748b', fontWeight: '600' },
  waterProgress: {
    width: '100%',
    height: '12px',
    backgroundColor: '#e2e8f0',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    overflow: 'hidden',
    position: 'relative'
  },
  waterProgressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
  },
  waterActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem'
  },
  waterButton: {
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
  },
  macrosSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: '2.5rem',
    position: 'relative',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1.5rem'
  },
  macrosGrid: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  macroItem: { marginBottom: '1rem' },
  macroHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem'
  },
  macroName: { fontSize: '0.9rem', fontWeight: '600', color: '#475569' },
  macroAmount: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
  macroBar: {
    width: '100%',
    height: '12px',
    backgroundColor: '#f1f5f9',
    borderRadius: '10px',
    overflow: 'hidden',
    position: 'relative'
  },
  macroProgress: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.5s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  },
  trackingGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2.5rem',
    marginBottom: '2.5rem'
  },
  mealsSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: 'relative',
    overflow: 'hidden'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  addButton: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #247ba0 0%, #1d4ed8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(36, 123, 160, 0.3)'
  },
  mealsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  mealCard: {
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '12px',
    padding: '1.25rem',
    background: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  mealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  mealInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  mealIcon: { fontSize: '1.75rem' },
  mealName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  mealCalories: { fontSize: '0.8rem', color: '#64748b', fontWeight: '500' },
  mealTime: { fontSize: '0.8rem', color: '#64748b', fontWeight: '500' },
  foodsList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  foodItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #f8fafc'
  },
  foodInfo: { flex: 1 },
  foodName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '0.25rem'
  },
  foodDetails: { fontSize: '0.75rem', color: '#64748b' },
  removeButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.75rem',
    transition: 'all 0.3s ease',
    fontWeight: '500'
  },
  exercisesSection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: 'relative',
    overflow: 'hidden'
  },
  exercisesList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  exerciseCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    borderRadius: '12px',
    background: 'white',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
  },
  exerciseIcon: {
    fontSize: '1.75rem',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    borderRadius: '12px'
  },
  exerciseInfo: { flex: 1 },
  exerciseName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  exerciseDetails: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '500'
  },
  summarySection: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    padding: '2rem',
    borderRadius: '20px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    position: 'relative',
    overflow: 'hidden'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem'
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    borderRadius: '16px',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    transition: 'all 0.3s ease'
  },
  summaryIcon: {
    fontSize: '2rem',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
    borderRadius: '12px'
  },
  summaryInfo: { flex: 1 },
  summaryValue: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '0.25rem'
  },
  summaryLabel: { fontSize: '0.8rem', color: '#64748b', fontWeight: '600' },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1002,
    padding: '2rem',
    backdropFilter: 'blur(8px)'
  },
  modalContent: {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: '20px',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 32px 64px rgba(0, 0, 0, 0.2)',
    border: '1px solid rgba(226, 232, 240, 0.8)',
    overflow: 'hidden'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 1.5rem',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1e293b',
    margin: 0
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0.25rem',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: { padding: '1.5rem' },
  modalText: {
    color: '#64748b',
    textAlign: 'center',
    margin: '0 0 1.5rem 0',
    fontSize: '0.9rem'
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  inputField: {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#1e293b',
    backgroundColor: '#ffffff',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
  },
  saveButton: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  },
  cancelButton: {
    background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
    color: 'white',
    border: 'none',
    padding: '0.875rem 1.5rem',
    borderRadius: '10px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)'
  },
  emptyState: {
    color: '#64748b',
    textAlign: 'center',
    padding: '2rem',
    fontSize: '0.9rem'
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    color: '#475569',
    fontWeight: '600'
  }
}

/* =========================
   MAIN COMPONENT
   ========================= */
export default function CalorieTracking () {
  const hasUserEdited = useRef(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [selectedDate] = useState(new Date())
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [showDatabaseFoods, setShowDatabaseFoods] = useState(false)
  const [waterIntake, setWaterIntake] = useState(0)
  const [dailyGoals, setDailyGoals] = useState(defaultDailyGoals)
  const [idUser, setIdUser] = useState(null)
  const [todayData, setTodayData] = useState(defaultTodayData)
  const [currentTime, setCurrentTime] = useState('')
  const [greeting, setGreeting] = useState('')
  const [databaseFoods, setDatabaseFoods] = useState([])
  const [loading, setLoading] = useState(false)
  const [storageKey, setStorageKey] = useState(null)
  const [isSavingWater, setIsSavingWater] = useState(false)
  // 🔔 Warning dari backend
  const [trackingWarnings, setTrackingWarnings] = useState([])
  const [trackingStatus, setTrackingStatus] = useState('ok')
  const [showWarningPopup, setShowWarningPopup] = useState(false)
  const [lastWarningSignature, setLastWarningSignature] = useState(null)
  const [showMacroInfo, setShowMacroInfo] = useState(false)
  const [showMacroInfoPopup, setShowMacroInfoPopup] = useState(false)
  const [showMacroPdf, setShowMacroPdf] = useState(false)

  // refs
  const initRef = useRef(false)
  const saveDbTimer = useRef(null)
  const isMounted = useRef(false)

  // NEW: block DB writes while initializing to avoid race
  const isInitializing = useRef(true)

  // 🧭 Ambil tanggal hari ini (string yyyy-mm-dd)
  const today = useMemo(() => new Date().toISOString().split('T')[0], [])

  /* =============================
     Helper: safe number parse
     ============================= */
  function toNumberSafe (v) {
    if (v === null || v === undefined) return 0
    const n = Number(v)
    return Number.isFinite(n) ? n : 0
  }
  function getWarningSignature (warnings = []) {
    if (!warnings.length) return 'none'
    return warnings
      .map(w => w.type)
      .sort()
      .join('|')
  }
  function getWarningAckKey (idUser) {
    return `simplefit_warning_ack_${idUser}`
  }

  function isOver (consumed, goal) {
    return consumed > goal
  }

  /* =============================
     normalize & recalc helpers
     ============================= */
  function normalizeTodayData (data) {
    if (!data) return JSON.parse(JSON.stringify(defaultTodayData))
    const clone = JSON.parse(JSON.stringify(data))
    clone.calories = clone.calories || {}
    clone.calories.consumed = toNumberSafe(clone.calories.consumed)
    clone.calories.burned = toNumberSafe(clone.calories.burned)

    clone.macros = clone.macros || {}
    clone.macros.protein = clone.macros.protein || {}
    clone.macros.carbs = clone.macros.carbs || {}
    clone.macros.fat = clone.macros.fat || {}
    clone.macros.protein.consumed = toNumberSafe(clone.macros.protein.consumed)
    clone.macros.carbs.consumed = toNumberSafe(clone.macros.carbs.consumed)
    clone.macros.fat.consumed = toNumberSafe(clone.macros.fat.consumed)

    clone.meals = (clone.meals || []).map(m => {
      m.foods = (m.foods || []).map(f => {
        return {
          ...f,
          calories: toNumberSafe(f.calories || f.kalori || 0),
          protein: toNumberSafe(f.protein || f.prot || 0),
          carbs: toNumberSafe(f.carbs || f.karbo || 0),
          fat: toNumberSafe(f.fat || f.lemak || 0)
        }
      })
      return m
    })

    clone.exercises = (clone.exercises || []).map(e => {
      return {
        ...e,
        calories: toNumberSafe(e.calories || 0),
        duration: toNumberSafe(e.duration || 0)
      }
    })

    return clone
  }

  const recalcTotals = useCallback((data, goals) => {
    const safeGoals = goals || defaultDailyGoals

    const newData = JSON.parse(JSON.stringify(data || defaultTodayData))
    let consumed = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    newData.meals = (newData.meals || []).map(m => {
      let total = 0
      m.foods = m.foods || []

      m.foods.forEach(f => {
        const kcal = toNumberSafe(f.calories || f.kalori || 0)
        const prot = toNumberSafe(f.protein || f.prot || 0)
        const carb = toNumberSafe(f.carbs || f.karbo || 0)
        const fat = toNumberSafe(f.fat || f.lemak || 0)

        total += kcal
        totalProtein += prot
        totalCarbs += carb
        totalFat += fat
      })

      m.totalCalories = Math.round(total)
      consumed += total
      return m
    })

    const burned = (newData.exercises || []).reduce(
      (s, e) => s + toNumberSafe(e.calories || 0),
      0
    )

    newData.calories = {
      consumed: Math.round(consumed),
      burned: Math.round(burned)
    }

    newData.macros = {
      protein: {
        consumed: Math.round(totalProtein),
        goal: safeGoals.protein
      },
      carbs: {
        consumed: Math.round(totalCarbs),
        goal: safeGoals.carbs
      },
      fat: {
        consumed: Math.round(totalFat),
        goal: safeGoals.fat
      }
    }

    return newData
  }, [])

  useEffect(() => {
    if (!idUser) return

    const warnings = []

    if (isOver(todayData.macros.carbs.consumed, dailyGoals.carbs)) {
      const key = getWarningAckKey(idUser, 'over_carbs')
      if (!localStorage.getItem(key)) {
        warnings.push({
          type: 'over_carbs',
          message: 'Asupan karbohidrat telah melewati batas harian.'
        })
      }
    }

    if (isOver(todayData.macros.fat.consumed, dailyGoals.fat)) {
      const key = getWarningAckKey(idUser, 'over_fat')
      if (!localStorage.getItem(key)) {
        warnings.push({
          type: 'over_fat',
          message: 'Asupan lemak telah melewati batas harian.'
        })
      }
    }

    if (warnings.length > 0) {
      setTrackingWarnings(warnings)
      setShowWarningPopup(true)
    }
  }, [
    todayData.macros.carbs.consumed,
    todayData.macros.fat.consumed,
    dailyGoals.carbs,
    dailyGoals.fat,
    idUser
  ])

  /* =============================
     1️⃣ Ambil ID user & sync target
     ============================= */

  useEffect(() => {
    try {
      let id = localStorage.getItem('id_user')

      // Jika tidak ada, cek userData (dari login terbaru)
      if (!id) {
        const user =
          localStorage.getItem('userData') || localStorage.getItem('user')
        if (user) {
          const parsed = JSON.parse(user)
          if (parsed?.id_user) {
            id = String(parsed.id_user)
            localStorage.setItem('id_user', id) // SIMPAN SUPAYA STABIL
          }
        }
      }

      if (id) {
        setIdUser(String(id))
      }
    } catch (err) {
      console.warn('Gagal baca id_user:', err)
    }
  }, [])

  // sync target kalori from storage when idUser available or when today changes
  useEffect(() => {
    if (!idUser) return
    if (showDatabaseFoods) return // ⛔ STOP FETCH
    const storedTarget = localStorage.getItem(`targetKalori_${idUser}`)
    if (storedTarget) {
      setDailyGoals(prev => ({
        ...prev,
        calories: Number(storedTarget) || prev.calories
      }))
    }
  }, [idUser, today])

  /* =============================
     2️⃣ Inisialisasi data (runs once after idUser ready)
     ============================= */
  useEffect(() => {
    if (!idUser) return
    if (showDatabaseFoods) return // ⛔ STOP FETCH
    const key = `simplefit_${idUser}_${today}`
    setStorageKey(key)

    // kalau sudah ada data hari ini → JANGAN INIT ULANG
    const saved = localStorage.getItem(key)
    let skipInit = false

    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTodayData(recalcTotals(normalizeTodayData(parsed)))

        const savedWater = localStorage.getItem(`${key}_water`)
        if (savedWater !== null) {
          setWaterIntake(Number(savedWater) || 0)
        }

        skipInit = true
      } catch (e) {
        console.warn('Gagal parse local data')
      }
    }

    const init = async () => {
      try {
        // 1) Try load from DB first (tracking entry for today)
        let trackingData = null
        try {
          // ambil email dari localStorage
          const rawUser = localStorage.getItem('userData')
          const parsedUser = rawUser ? JSON.parse(rawUser) : null
          const email = parsedUser?.email

          if (!email) {
            console.warn('Email user tidak ditemukan')
            return
          }

          const trackingRes = await fetch(
            `/api/tracking?email=${encodeURIComponent(email)}&tanggal=${today}`,
            { cache: 'no-store' }
          )

          if (trackingRes.ok) {
            const json = await trackingRes.json()
            // API might return an object or array
            if (Array.isArray(json) && json.length) trackingData = json[0]
            else if (json && Object.keys(json).length) trackingData = json
          }
        } catch (err) {
          console.warn('Gagal fetch tracking dari DB:', err)
        }

        // ⚠️ JANGAN timpa state kalau user sudah edit
        if (
          trackingData &&
          trackingData.id_tracking &&
          !hasUserEdited.current
        ) {
          let mealsFromDb = []
          let exercisesFromDb = []

          try {
            mealsFromDb = trackingData.detail_makanan
              ? JSON.parse(trackingData.detail_makanan)
              : []
          } catch {}

          try {
            exercisesFromDb = trackingData.detail_aktivitas
              ? JSON.parse(trackingData.detail_aktivitas)
              : []
          } catch {}

          const normalized = normalizeTodayData({
            meals: mealsFromDb,
            exercises: exercisesFromDb,
            calories: {
              consumed: trackingData.kalori_dikonsumsi || 0,
              burned: trackingData.kalori_dibakar || 0
            },
            macros: {
              protein: { consumed: trackingData.protein || 0 },
              carbs: { consumed: trackingData.karbohidrat || 0 },
              fat: { consumed: trackingData.lemak || 0 }
            }
          })

          setTodayData(recalcTotals(normalized))
          setWaterIntake(trackingData.air || 0)
        }

        // 3) Then try load from localStorage (local edits take precedence)

        // load water if saved (again)
        const savedWater2 = localStorage.getItem(`${key}_water`)
        if (savedWater2 !== null && savedWater2 !== undefined) {
          setWaterIntake(Number(savedWater2) || 0)
        }

        // reset if day changed (lastTrackedDay per user)
        // fetch user target from DB (bmi) and update dailyGoals
        try {
          const res = await fetch(`/api/bmi?id_user=${idUser}`)
          if (res.ok) {
            const user = await res.json()
            const targetKalori =
              Number(user?.target_kalori) ||
              dailyGoals.calories ||
              defaultDailyGoals.calories
            setDailyGoals(prev => ({ ...prev, calories: targetKalori }))
            localStorage.setItem(`targetKalori_${idUser}`, targetKalori)
          }
        } catch (err) {
          console.warn('Gagal ambil target kalori dari DB:', err)
        }

        // finally fetch foods DB
      } catch (error) {
        console.error('❌ Gagal inisialisasi data:', error)
      } finally {
        // initialization done (allow save effect to post to DB)
        isInitializing.current = false
      }
    }

    // small delay to allow any surrounding renders to settle
    setTimeout(init, 150)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idUser, today, recalcTotals])

  /* =============================
     3️⃣ Simpan ke localStorage segera; ke DB dengan debounce
     ============================= */
  useEffect(() => {
    // save to localStorage whenever todayData or waterIntake changes and storageKey is present
    if (!storageKey) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(todayData))
      localStorage.setItem(`${storageKey}_water`, String(waterIntake))
    } catch (err) {
      console.warn('⚠️ Gagal menyimpan ke localStorage:', err)
    }

    // don't post to DB while still initializing — localStorage suffices for UX
    if (!idUser || isInitializing.current) {
      return
    }

    // debounce save to DB (avoid spamming API while user interacts)
    if (saveDbTimer.current) clearTimeout(saveDbTimer.current)
    saveDbTimer.current = setTimeout(async () => {
      try {
        // prepare numeric user id
        const numericUserId = Number(idUser)

        // construct payload - include both userId (expected by backend) and id_user (compatibility)
        const payload = {
          userId: numericUserId,
          id_user: idUser, // keep for backward compatibility (string ok)
          tanggal: today,
          kalori_dikonsumsi: todayData.calories?.consumed || 0,
          kalori_dibakar: todayData.calories?.burned || 0,
          air: waterIntake,
          protein: todayData.macros?.protein?.consumed || 0,
          karbohidrat: todayData.macros?.carbs?.consumed || 0,
          lemak: todayData.macros?.fat?.consumed || 0,
          // include meals/exercises if backend supports them (optional)
          meals: todayData.meals || [],
          exercises: todayData.exercises || []
        }

        const res = await fetch('/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        // handle response
        if (!res.ok) {
          // log server's response body for debugging
          let errBody = null
          try {
            errBody = await res.json()
          } catch (e) {
            errBody = await res.text().catch(() => null)
          }
          console.warn(
            '⚠️ Gagal simpan tracking ke DB (status ' + res.status + '):',
            errBody
          )
        } else {
          // optional: read returned data to update UI verification (if backend returns saved row)
          try {
            const data = await res.json()
            if (data?.warnings && data.warnings.length > 0) {
              const signature = getWarningSignature(data.warnings)
              const ackKey = getWarningAckKey(idUser)
              const lastAcked = localStorage.getItem(ackKey)

              setTrackingWarnings(data.warnings)
              setTrackingStatus(data.status || 'warning')
              setLastWarningSignature(signature)

              // popup hanya muncul kalau:
              // 1. belum pernah di-ack
              // 2. atau warning berubah
              if (lastAcked !== signature) {
                setShowWarningPopup(true)
              }
            }

            // if backend returns todayRow or saved value, sync local state (optional)
            if (data?.todayRow?.air !== undefined) {
              setWaterIntake(Number(data.todayRow.air) || 0)
            }
            // optionally update other local values from server response here
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (err) {
        console.warn('⚠️ Error while saving tracking to DB:', err)
      }
    }, 900) // 900ms debounce

    // cleanup on unmount
    return () => {
      if (saveDbTimer.current) clearTimeout(saveDbTimer.current)
    }
  }, [todayData, waterIntake, storageKey, idUser, today])

  /* =============================
     4️⃣ Fetch makanan dari database
     ============================= */
  const fetchDatabaseFoods = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/makanan')
      if (response.ok) {
        const foods = await response.json()
        setDatabaseFoods(foods || [])
      } else {
        console.error('⚠️ Gagal mengambil data makanan dari API')
        setDatabaseFoods([])
      }
    } catch (error) {
      console.error('❌ Error fetching foods:', error)
      setDatabaseFoods([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!showDatabaseFoods) return
    fetchDatabaseFoods()
  }, [showDatabaseFoods, fetchDatabaseFoods])

  /* =============================
     Add / delete food in DB
     ============================= */
  const addFoodToDatabase = async (foodData, kategori) => {
    try {
      const response = await fetch('/api/makanan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: foodData.name,
          kategori: kategori,
          karbo: foodData.carbs || 0,
          protein: foodData.protein || 0,
          lemak: foodData.fat || 0,
          kalori: foodData.calories || 0,
          air: 0
        })
      })

      if (response.ok) {
        await fetchDatabaseFoods()
        return true
      } else return false
    } catch (error) {
      console.error('❌ Error adding food:', error)
      return false
    }
  }

  const deleteFoodFromDatabase = async foodId => {
    try {
      const response = await fetch('/api/makanan', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_makanan: foodId })
      })

      if (response.ok) {
        await fetchDatabaseFoods()
        return true
      } else return false
    } catch (error) {
      console.error('❌ Error deleting food:', error)
      return false
    }
  }

  /* =============================
     6️⃣  Waktu, salam, dan scroll
     ============================= */
  useEffect(() => {
    isMounted.current = true
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)

    const updateTimeAndGreeting = () => {
      const now = new Date()
      const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
      if (isMounted.current) setCurrentTime(timeString)

      const hour = now.getHours()
      if (hour < 12) setGreeting('Pagi')
      else if (hour < 15) setGreeting('Siang')
      else if (hour < 18) setGreeting('Sore')
      else setGreeting('Malam')
    }

    updateTimeAndGreeting()
    const timer = setInterval(updateTimeAndGreeting, 60000)

    return () => {
      isMounted.current = false
      window.removeEventListener('scroll', handleScroll)
      clearInterval(timer)
      if (saveDbTimer.current) clearTimeout(saveDbTimer.current)
    }
  }, [])

  /* =============================
     Utility / UI helper functions
     ============================= */
  function getTimeNow () {
    const d = new Date()
    return `${String(d.getHours()).padStart(2, '0')}:${String(
      d.getMinutes()
    ).padStart(2, '0')}`
  }

  function parseFoodItem (item) {
    if (!item)
      return { name: 'Makanan', calories: 0, protein: 0, carbs: 0, fat: 0 }

    const name = item.name || item.nama || item.food_name || 'Makanan Manual'
    const calories = toNumberSafe(
      item.calories ?? item.kalori ?? item.kcal ?? 0
    )
    const protein = toNumberSafe(item.protein ?? item.prot ?? 0)
    const carbs = toNumberSafe(item.carbs ?? item.karbo ?? 0)
    const fat = toNumberSafe(item.fat ?? item.lemak ?? 0)

    return {
      name,
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat)
    }
  }

  const remainingCalories = useMemo(() => {
    const consumed = todayData.calories?.consumed || 0
    const burned = todayData.calories?.burned || 0
    const goal = dailyGoals.calories || 0

    return Math.round(goal - consumed + burned)
  }, [
    todayData.calories?.consumed,
    todayData.calories?.burned,
    dailyGoals.calories
  ])

  function capitalizeMealName (type) {
    if (!type) return 'Makanan'
    if (type === 'breakfast') return 'Sarapan'
    if (type === 'lunch') return 'Makan Siang'
    if (type === 'dinner') return 'Makan Malam'
    if (type === 'snack') return 'Camilan'
    return type.charAt(0).toUpperCase() + type.slice(1)
  }

  function mapMealTypeToKategori (mealType) {
    const mapping = {
      breakfast: 'sarapan',
      lunch: 'makan_siang',
      dinner: 'makan_malam',
      snack: 'camilan'
    }
    return mapping[mealType] || 'camilan'
  }

  function mapKategoriToMealType (kategori) {
    const mapping = {
      sarapan: 'breakfast',
      makan_siang: 'lunch',
      makan_malam: 'dinner',
      camilan: 'snack'
    }
    return mapping[kategori] || 'snack'
  }

  // add food to meal (ke state; will auto persist)
  const addFoodToMeal = (food, mealType = 'snack') => {
    hasUserEdited.current = true // 🔥 WAJIB
    const parsed = parseFoodItem(food)

    setTodayData(prev => {
      const clone = JSON.parse(JSON.stringify(prev || defaultTodayData))
      clone.meals = clone.meals || []

      let mealIndex = clone.meals.findIndex(m => m.type === mealType)

      const foodWithTime = {
        id: Date.now() + Math.floor(Math.random() * 999),
        ...parsed,
        time: getTimeNow()
      }

      if (mealIndex === -1) {
        const newMeal = {
          id: Date.now(),
          type: mealType,
          name: capitalizeMealName(mealType),
          icon: '🍽️',
          foods: [foodWithTime],
          totalCalories: parsed.calories
        }
        clone.meals.push(newMeal)
      } else {
        clone.meals[mealIndex].foods.push(foodWithTime)
      }

      const recalced = recalcTotals(normalizeTodayData(clone))
      return recalced
    })
  }
  const removeFood = (mealIndex, foodIndex) => {
    hasUserEdited.current = true // ✅ WAJIB

    let nextData = null

    setTodayData(prev => {
      const clone = structuredClone(prev)

      clone.meals[mealIndex].foods.splice(foodIndex, 1)

      if (clone.meals[mealIndex].foods.length === 0) {
        clone.meals.splice(mealIndex, 1)
      }

      nextData = recalcTotals(normalizeTodayData(clone))
      return nextData
    })

    // 🔥 COMMIT LANGSUNG KE DB
    setTimeout(() => {
      if (nextData) {
        commitTrackingNow(nextData)
        window.dispatchEvent(new Event('tracking-updated'))
      }
    }, 0)
  }

  function recalcFromMeals (meals = []) {
    let totalKalori = 0
    let protein = 0
    let karbohidrat = 0
    let lemak = 0

    meals.forEach(meal => {
      meal.foods?.forEach(f => {
        totalKalori += Number(f.calories || 0)
        protein += Number(f.protein || 0)
        karbohidrat += Number(f.carbs || 0)
        lemak += Number(f.fat || 0)
      })
    })

    return {
      totalKalori,
      protein,
      karbohidrat,
      lemak
    }
  }

  const commitTrackingNow = async data => {
    try {
      const id_user = localStorage.getItem('id_user')
      if (!id_user) return

      const tanggal = new Date().toISOString().slice(0, 10)

      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user,
          userId: Number(id_user),
          tanggal,
          meals: data.meals,
          exercises: data.exercises
        })
      })

      if (res.ok) {
        const responseData = await res.json().catch(() => null)
        if (responseData?.warnings) {
          setTrackingWarnings(responseData.warnings)
          setTrackingStatus(responseData.status || 'ok')
        }
      }
    } catch (e) {
      console.error('❌ gagal commit tracking', e)
    }
  }

  const addExercise = exercise => {
    setTodayData(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      clone.exercises = clone.exercises || []
      clone.exercises.push({
        id: Date.now(),
        ...exercise,
        time: getTimeNow()
      })
      return recalcTotals(normalizeTodayData(clone))
    })
    setShowAddExercise(false)
  }

  // save water
  const addWater = async amount => {
    if (!idUser) {
      console.warn('idUser belum tersedia — tidak bisa menyimpan ke server')
      return
    }

    // hentikan pending save DB supaya tidak saling tumpang tindih
    if (saveDbTimer.current) {
      clearTimeout(saveDbTimer.current)
      saveDbTimer.current = null
    }

    if (isSavingWater) return
    setIsSavingWater(true)

    const prev = waterIntake
    const optimistic = Math.min(prev + amount, 5000)
    console.log('[WATER] optimistic add', {
      prev,
      amount,
      optimistic,
      storageKey
    })
    setWaterIntake(optimistic)
    if (storageKey)
      localStorage.setItem(`${storageKey}_water`, String(optimistic))

    try {
      const numericUserId = Number(idUser)
      const date = new Date().toISOString().slice(0, 10)

      // kirim kedua key userId dan id_user — backend Anda kadang butuh salah satu
      const payload = {
        userId: numericUserId,
        id_user: String(idUser),
        tanggal: date,
        add_air: Number(amount)
      }

      console.log('[WATER] POST /api/tracking payload', payload)

      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      console.log('[WATER] response status', res.status)

      if (!res.ok) {
        let body = null
        try {
          body = await res.json()
        } catch (e) {
          body = await res.text().catch(() => null)
        }
        console.warn('[WATER] server rejected add_air:', res.status, body)
        // rollback ke prev
        setWaterIntake(prev)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(prev))
        return
      }

      // parse body kalau ada
      let data = null
      try {
        data = await res.json()
      } catch (e) {
        data = null
      }

      console.log('[WATER] server returned body', data)

      if (data?.todayRow?.air !== undefined) {
        const serverAir = Number(data.todayRow.air) || 0
        console.log('[WATER] sync to serverAir', serverAir)
        setWaterIntake(serverAir)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(serverAir))
      } else {
        // server tidak mengembalikan authoritative value — tetap pakai optimistic
        console.log('[WATER] no authoritative value returned, keep optimistic')
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(optimistic))
      }
    } catch (err) {
      console.warn('[WATER] network/error saat POST add_air:', err)
      // rollback on network error
      setWaterIntake(prev)
      if (storageKey) localStorage.setItem(`${storageKey}_water`, String(prev))
    } finally {
      setIsSavingWater(false)
    }
  }

  const subtractWater = async amount => {
    if (!idUser) {
      console.warn('[WATER] subtract: idUser belum tersedia — abort')
      return
    }

    if (saveDbTimer.current) {
      clearTimeout(saveDbTimer.current)
      saveDbTimer.current = null
    }
    if (isSavingWater) {
      console.warn('[WATER] subtract: in progress — abort')
      return
    }
    setIsSavingWater(true)

    const prev = waterIntake
    const optimistic = Math.max(prev - amount, 0)
    setWaterIntake(optimistic)
    if (storageKey)
      localStorage.setItem(`${storageKey}_water`, String(optimistic))

    try {
      const numericUserId = Number(idUser)
      const date = new Date().toISOString().slice(0, 10)

      const payload = {
        userId: numericUserId,
        id_user: String(idUser), // <- ensure compatibility
        tanggal: date,
        add_air: -Number(amount)
      }
      console.log('[WATER] POST subtract payload', payload)

      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        let body = null
        try {
          body = await res.json()
        } catch (e) {
          body = await res.text().catch(() => null)
        }
        console.warn('[WATER] server rejected subtract_air:', res.status, body)
        // rollback
        setWaterIntake(prev)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(prev))
        return
      }

      let data = null
      try {
        data = await res.json()
      } catch (e) {
        data = null
      }

      if (data?.todayRow?.air !== undefined) {
        const serverAir = Number(data.todayRow.air) || 0
        setWaterIntake(serverAir)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(serverAir))
      } else {
        // keep optimistic value if server returns nothing authoritative
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(optimistic))
      }
    } catch (err) {
      console.warn('[WATER] network/error saat POST subtract_air:', err)
      setWaterIntake(prev)
      if (storageKey) localStorage.setItem(`${storageKey}_water`, String(prev))
    } finally {
      setIsSavingWater(false)
    }
  }

  const resetWaterToZero = async () => {
    if (!idUser) {
      console.warn('[WATER] reset: idUser belum tersedia — abort')
      return
    }

    if (saveDbTimer.current) {
      clearTimeout(saveDbTimer.current)
      saveDbTimer.current = null
    }
    if (isSavingWater) {
      console.warn('[WATER] reset: in progress — abort')
      return
    }
    setIsSavingWater(true)

    const prev = waterIntake
    setWaterIntake(0)
    if (storageKey) localStorage.setItem(`${storageKey}_water`, '0')

    try {
      const numericUserId = Number(idUser)
      const date = new Date().toISOString().slice(0, 10)

      const payload = {
        userId: numericUserId,
        id_user: String(idUser), // <- ensure compatibility
        tanggal: date,
        reset_air: true
      }
      console.log('[WATER] POST reset payload', payload)

      const res = await fetch('/api/tracking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        let body = null
        try {
          body = await res.json()
        } catch (e) {
          body = await res.text().catch(() => null)
        }
        console.warn('[WATER] server rejected reset_air:', res.status, body)
        // rollback
        setWaterIntake(prev)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(prev))
        return
      }

      let data = null
      try {
        data = await res.json()
      } catch (e) {
        data = null
      }

      if (data?.todayRow?.air !== undefined) {
        const serverAir = Number(data.todayRow.air) || 0
        setWaterIntake(serverAir)
        if (storageKey)
          localStorage.setItem(`${storageKey}_water`, String(serverAir))
      }
      // jika server tidak kembalikan body, kita tetap optimistic 0 (sudah disimpan di localStorage)
    } catch (err) {
      console.warn('[WATER] network/error saat POST reset_air:', err)
      setWaterIntake(prev)
      if (storageKey) localStorage.setItem(`${storageKey}_water`, String(prev))
    } finally {
      setIsSavingWater(false)
    }
  }

  const handleLogout = () => {
    // hanya hapus token
    localStorage.removeItem('token')

    // ❌ JANGAN hapus userData
    // ❌ JANGAN hapus id_user

    window.location.href = '/login'
  }

  /* =============================
     Small UI components
     ============================= */
  const ProgressCircle = ({ consumed, goal, size = 120, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const progress = Math.min(consumed / goal, 1)
    const strokeDashoffset = circumference - progress * circumference

    return (
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='#e2e8f0'
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill='none'
            stroke='url(#progressGradient)'
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap='round'
          />
          <defs>
            <linearGradient
              id='progressGradient'
              x1='0%'
              y1='0%'
              x2='100%'
              y2='0%'
            >
              <stop offset='0%' stopColor='#70c1b3' />
              <stop offset='100%' stopColor='#247ba0' />
            </linearGradient>
          </defs>
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}
        >
          <div
            style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}
          >
            {consumed}
          </div>
          <div
            style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}
          >
            dari {goal}
          </div>
        </div>
      </div>
    )
  }

  /* =============================
     RENDER (UI kamu tidak diubah)
     ============================= */
  return (
    <div style={styles.container}>
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          <div style={styles.headerSection}>
            <div style={styles.headerText}>
              <h1 style={styles.pageTitle}>Tracking Kalori</h1>
              <p style={styles.pageSubtitle}>
                Pantau asupan nutrisi dan aktivitas fisik harian Anda
              </p>
            </div>
            <div style={styles.dateSection}>
              <div style={styles.dateDisplay}>
                <span style={styles.dateText}>
                  {selectedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div style={styles.statsSection}>
            <motion.div
              style={styles.calorieCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div style={styles.calorieHeader}>
                <h3 style={styles.calorieTitle}>Kalori Hari Ini</h3>
                <div style={styles.calorieStats}>
                  <div style={styles.calorieStat}>
                    <span style={styles.calorieConsumed}>
                      Dikonsumsi: {todayData.calories?.consumed ?? 0}
                    </span>
                  </div>
                  <div style={styles.calorieStat}>
                    <span style={styles.calorieBurned}>
                      Dibakar: {todayData.calories?.burned ?? 0}
                    </span>
                  </div>
                  <div style={styles.calorieStat}>
                    <span
                      style={{
                        ...styles.calorieRemaining,
                        color: remainingCalories > 0 ? '#10b981' : '#ef4444'
                      }}
                    >
                      Tersisa: {remainingCalories}
                    </span>
                  </div>
                </div>
              </div>
              <ProgressCircle
                consumed={todayData.calories?.consumed || 0}
                goal={dailyGoals.calories}
              />
            </motion.div>

            <motion.div
              style={styles.waterCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div style={styles.waterHeader}>
                <h3 style={styles.waterTitle}>💧 Asupan Air</h3>
                <span style={styles.waterAmount}>
                  {waterIntake}ml / {dailyGoals.water}ml
                </span>
              </div>
              <div style={styles.waterProgress}>
                <div
                  style={{
                    ...styles.waterProgressFill,
                    width: `${Math.min(
                      (waterIntake / dailyGoals.water) * 100,
                      100
                    )}%`
                  }}
                />
              </div>
              <div style={{ ...styles.waterActions, marginBottom: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addWater(250)}
                  style={{
                    ...styles.waterButton,
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  +250ml
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addWater(500)}
                  style={{
                    ...styles.waterButton,
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  +500ml
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addWater(1000)}
                  style={{
                    ...styles.waterButton,
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  +1000ml
                </motion.button>
              </div>
              <div style={styles.waterActions}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => subtractWater(250)}
                  style={{
                    ...styles.waterButton,
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  -250ml
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => subtractWater(500)}
                  style={{
                    ...styles.waterButton,
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  -500ml
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => subtractWater(1000)}
                  style={{
                    ...styles.waterButton,
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  -1000ml
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={resetWaterToZero}
                  style={{
                    ...styles.waterButton,
                    background:
                      'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    opacity: isSavingWater ? 0.6 : 1,
                    pointerEvents: isSavingWater ? 'none' : undefined
                  }}
                  disabled={isSavingWater}
                >
                  Reset Air
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            style={styles.macrosSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3
              style={{
                ...styles.sectionTitle,
                display: 'flex',
                alignItems: 'center'
              }}
            >
              Makronutrien
              <MacroInfoTooltip />
            </h3>

            <div style={styles.macrosGrid}>
              <MacroBar
                consumed={todayData.macros?.protein?.consumed ?? 0}
                goal={todayData.macros?.protein?.goal ?? dailyGoals.protein}
                type='Protein'
                color='linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
              />
              <MacroBar
                consumed={todayData.macros?.carbs?.consumed ?? 0}
                goal={todayData.macros?.carbs?.goal ?? dailyGoals.carbs}
                type='Karbohidrat'
                color='linear-gradient(135deg, #10b981 0%, #059669 100%)'
              />
              <MacroBar
                consumed={todayData.macros?.fat?.consumed ?? 0}
                goal={todayData.macros?.fat?.goal ?? dailyGoals.fat}
                type='Lemak'
                color='linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              />
            </div>
          </motion.div>

          <div style={styles.trackingGrid}>
            <motion.div
              style={styles.mealsSection}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Makanan Hari Ini</h3>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowMacroPdf(true)}
                    style={{
                      ...styles.addButton,
                      background:
                        'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                    }}
                  >
                    📘 Panduan Gizi
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDatabaseFoods(true)}
                    style={{
                      ...styles.addButton,
                      background:
                        'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    }}
                  >
                    📋 Histori Makanan
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddFood(true)}
                    style={styles.addButton}
                  >
                    + Tambah Makanan
                  </motion.button>
                </div>
              </div>

              <div style={styles.mealsList}>
                {todayData.meals?.map((meal, mealIndex) => (
                  <motion.div
                    key={meal.id || meal.type || mealIndex}
                    style={styles.mealCard}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={styles.mealHeader}>
                      <div style={styles.mealInfo}>
                        <span style={styles.mealIcon}>{meal.icon}</span>
                        <div>
                          <h4 style={styles.mealName}>{meal.name}</h4>
                          <span style={styles.mealCalories}>
                            {meal.totalCalories} kalori
                          </span>
                        </div>
                      </div>
                      <span style={styles.mealTime}>
                        {meal.foods[0]?.time || getTimeNow()}
                      </span>
                    </div>
                    <div style={styles.foodsList}>
                      {meal.foods.map((food, foodIndex) => (
                        <div key={food.id ?? `${meal.id}-${foodIndex}`}>
                          <div style={styles.foodInfo}>
                            <h5 style={styles.foodName}>{food.name}</h5>
                            <div style={styles.foodDetails}>
                              {food.calories} kalori • {food.protein}g protein •{' '}
                              {food.carbs}g karbo • {food.fat}g lemak
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeFood(mealIndex, foodIndex)}
                            style={styles.removeButton}
                          >
                            Hapus
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
                {(!todayData.meals || todayData.meals.length === 0) && (
                  <div style={styles.emptyState}>
                    Belum ada makanan yang ditambahkan hari ini
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              style={styles.exercisesSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}>Aktivitas Fisik</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAddExercise(true)}
                  style={styles.addButton}
                >
                  + Tambah Aktivitas
                </motion.button>
              </div>

              <div style={styles.exercisesList}>
                {todayData.exercises?.map(exercise => (
                  <motion.div
                    key={exercise.id}
                    style={styles.exerciseCard}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div style={styles.exerciseIcon}>
                      {exercise.type === 'cardio' ? '🏃' : '💪'}
                    </div>
                    <div style={styles.exerciseInfo}>
                      <h4 style={styles.exerciseName}>{exercise.name}</h4>
                      <div style={styles.exerciseDetails}>
                        <span>🔥 {exercise.calories} cal</span>
                        <span>⏱️ {exercise.duration} menit</span>
                        <span>🕒 {exercise.time}</span>
                      </div>
                    </div>
                    <div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setTodayData(prev => {
                            const clone = JSON.parse(JSON.stringify(prev))
                            clone.exercises = (clone.exercises || []).filter(
                              ex => String(ex.id) !== String(exercise.id)
                            )
                            return recalcTotals(normalizeTodayData(clone))
                          })
                        }}
                        style={{
                          ...styles.cancelButton,
                          background:
                            'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                          minWidth: 80
                        }}
                      >
                        Hapus
                      </motion.button>
                    </div>
                  </motion.div>
                ))}

                {(!todayData.exercises || todayData.exercises.length === 0) && (
                  <div style={styles.emptyState}>Belum ada aktivitas</div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div
            style={styles.summarySection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h3 style={styles.sectionTitle}>Ringkasan Harian</h3>
            <div style={styles.summaryGrid}>
              {[
                {
                  icon: '📊',
                  value: todayData.calories?.consumed ?? 0,
                  label: 'Total Kalori'
                },
                {
                  icon: '💪',
                  value: `${todayData.macros?.protein?.consumed ?? 0}g`,
                  label: 'Total Protein'
                },
                {
                  icon: '🔥',
                  value: todayData.calories?.burned ?? 0,
                  label: 'Kalori Terbakar'
                },
                { icon: '💧', value: `${waterIntake}ml`, label: 'Air Diminum' }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  style={styles.summaryCard}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={styles.summaryIcon}>{item.icon}</div>
                  <div style={styles.summaryInfo}>
                    <div style={styles.summaryValue}>{item.value}</div>
                    <div style={styles.summaryLabel}>{item.label}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      {/* Modal Tambah Makanan Manual */}
      {showAddFood && (
        <motion.div
          style={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Tambah Makanan</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddFood(false)}
                style={styles.closeButton}
              >
                ✕
              </motion.button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                Masukkan detail makanan yang dikonsumsi.
              </p>
              <FoodForm
                onAdd={(food, mealType) => {
                  addFoodToMeal(food, mealType)
                  setShowAddFood(false)
                }}
                onCancel={() => setShowAddFood(false)}
                addFoodToDatabase={addFoodToDatabase}
                mapMealTypeToKategori={mapMealTypeToKategori}
              />
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Database Makanan */}
      {showDatabaseFoods && (
        <motion.div
          style={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{ ...styles.modalContent, maxWidth: '800px' }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Database Makanan</h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchDatabaseFoods}
                  style={{
                    ...styles.addButton,
                    background:
                      'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
                  }}
                >
                  🔄 Refresh
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDatabaseFoods(false)}
                  style={styles.closeButton}
                >
                  ✕
                </motion.button>
              </div>
            </div>
            <div style={styles.modalBody}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Pilih Waktu Makan:</label>
                <select
                  id='mealTypeSelect'
                  style={styles.inputField}
                  defaultValue='snack'
                >
                  <option value='breakfast'>Sarapan</option>
                  <option value='lunch'>Makan Siang</option>
                  <option value='dinner'>Makan Malam</option>
                  <option value='snack'>Camilan</option>
                </select>
              </div>

              {loading ? (
                <div style={styles.emptyState}>Memuat data makanan...</div>
              ) : databaseFoods.length === 0 ? (
                <div style={styles.emptyState}>
                  Belum ada makanan dalam database
                </div>
              ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {databaseFoods.map(food => (
                    <motion.div
                      key={food.id_makanan}
                      style={{ ...styles.mealCard, marginBottom: '0.5rem' }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <h4 style={styles.foodName}>{food.nama}</h4>
                          <div style={styles.foodDetails}>
                            Kategori: {food.kategori} • Kalori:{' '}
                            {food.kalori || 0} • Protein: {food.protein || 0}g •
                            Karbo: {food.karbo || 0}g • Lemak: {food.lemak || 0}{' '}
                            g
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const mealTypeSelect =
                                document.getElementById('mealTypeSelect')
                              const selectedMealType = mealTypeSelect
                                ? mealTypeSelect.value
                                : 'snack'

                              addFoodToMeal(
                                {
                                  name: food.nama,
                                  calories: food.kalori || 0,
                                  protein: food.protein || 0,
                                  carbs: food.karbo || 0,
                                  fat: food.lemak || 0
                                },
                                selectedMealType
                              )
                              setShowDatabaseFoods(false)
                            }}
                            style={styles.addButton}
                          >
                            Tambah ke Hari Ini
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={async () => {
                              if (
                                confirm(`Hapus ${food.nama} dari database?`)
                              ) {
                                await deleteFoodFromDatabase(food.id_makanan)
                              }
                            }}
                            style={{ ...styles.removeButton, margin: 0 }}
                          >
                            Hapus
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Modal Tambah Aktivitas */}
      {showAddExercise && (
        <motion.div
          style={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={styles.modalContent}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Tambah Aktivitas</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowAddExercise(false)}
                style={styles.closeButton}
              >
                ✕
              </motion.button>
            </div>
            <div style={styles.modalBody}>
              <p style={styles.modalText}>
                Masukkan detail aktivitas cepat (nama, tipe, kalori, durasi).
              </p>
              <ExerciseForm
                onAdd={ex => {
                  addExercise(ex)
                }}
                onCancel={() => setShowAddExercise(false)}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
      {/* 🔔 POP-UP PERINGATAN NUTRISI */}
      {showWarningPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#fff7ed',
              borderRadius: 18,
              width: '100%',
              maxWidth: 420,
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              border: '1px solid #fdba74'
            }}
          >
            <h3 style={{ marginBottom: 12, color: '#9a3412' }}>
              ⚠️ Peringatan Nutrisi
            </h3>

            <ul style={{ paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              {trackingWarnings.map((w, i) => (
                <li key={i} style={{ marginBottom: 6, color: '#7c2d12' }}>
                  {w.message}
                </li>
              ))}
            </ul>

            {/* 🔍 REKOMENDASI KONTEKSTUAL */}
            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '0.75rem 1rem',
                marginBottom: '1.25rem',
                border: '1px solid #fed7aa'
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  marginBottom: 6,
                  color: '#9a3412'
                }}
              >
                Rekomendasi untuk sisa hari ini:
              </div>

              <ul
                style={{
                  paddingLeft: '1.1rem',
                  fontSize: '0.8rem',
                  color: '#7c2d12'
                }}
              >
                {trackingWarnings.some(w => w.type === 'over_carbs') && (
                  <>
                    <li>
                      Kurangi porsi nasi, mie, atau makanan berbahan tepung
                    </li>
                    <li>Utamakan protein dan sayur pada makan berikutnya</li>
                  </>
                )}

                {trackingWarnings.some(w => w.type === 'over_fat') && (
                  <>
                    <li>Hindari gorengan dan makanan bersantan</li>
                    <li>Pilih metode masak panggang atau rebus</li>
                  </>
                )}
              </ul>
            </div>

            <button
              onClick={() => {
                const ackKey = getWarningAckKey(idUser)
                localStorage.setItem(ackKey, lastWarningSignature)

                setShowWarningPopup(false)
              }}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: 10,
                border: 'none',
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Saya Mengerti
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* 📘 POP-UP EDUKASI MAKRONUTRIEN */}
      {showMacroInfoPopup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 3100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#ffffff',
              borderRadius: 18,
              width: '100%',
              maxWidth: 480,
              padding: '1.75rem',
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)'
            }}
          >
            <h3 style={{ marginBottom: 12, color: '#1e293b' }}>
              📘 Edukasi Makronutrien
            </h3>

            <div
              style={{ fontSize: '0.9rem', color: '#475569', marginBottom: 14 }}
            >
              Tidak semua pengguna memahami detail makronutrien. Fitur ini
              membantu memberikan konteks kesehatan tanpa perlu mencari
              informasi secara terpisah.
            </div>

            <div style={{ marginBottom: 14 }}>
              <strong>⚠️ Karbohidrat Berlebih</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Konsumsi karbohidrat berlebihan dapat meningkatkan kadar gula
                darah dan berisiko menyebabkan penambahan berat badan.
              </p>
              <a
                href='https://www.alodokter.com/kelebihan-karbohidrat-ketahui-8-dampaknya-untuk-kesehatan-tubuh'
                target='_blank'
                rel='noopener noreferrer'
                style={{ fontSize: '0.8rem', color: '#2563eb' }}
              >
                Baca artikel Alodokter →
              </a>
            </div>

            <div style={{ marginBottom: 20 }}>
              <strong>⚠️ Lemak Berlebih</strong>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Asupan lemak berlebih, terutama lemak jenuh, dapat meningkatkan
                risiko obesitas dan penyakit jantung.
              </p>
              <a
                href='https://www.klikdokter.com/gaya-hidup/diet-nutrisi/akibat-kelebihan-lemak?srsltid=AfmBOooNxa07KnxnyJIv9WlUW7B1_7wHZZl-FD-4-oRC1GLCzs0TgvnX'
                target='_blank'
                rel='noopener noreferrer'
                style={{ fontSize: '0.8rem', color: '#2563eb' }}
              >
                Baca artikel HelloSehat →
              </a>
            </div>

            <button
              onClick={() => setShowMacroInfoPopup(false)}
              style={{
                width: '100%',
                padding: '0.65rem',
                borderRadius: 10,
                border: 'none',
                background:
                  'linear-gradient(135deg, #9c2929ff 0%, #d24343ff 100%)',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Tutup
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* 📘 MODAL PANDUAN GIZI (PDF) */}
      {showMacroPdf && (
        <motion.div
          style={styles.modalOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            style={{
              ...styles.modalContent,
              maxWidth: '85vw',
              height: '85vh',
              display: 'flex',
              flexDirection: 'column'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>📘 Panduan Informasi Gizi</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowMacroPdf(false)}
                style={styles.closeButton}
              >
                ✕
              </motion.button>
            </div>

            <div style={{ flex: 1 }}>
              <iframe
                src='/panduan/panduan-makronutrien-makanan-tanpa-bahan-mentah.pdf'
                width='100%'
                height='100%'
                style={{ border: 'none' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )

  /* ===========================
   Subcomponents: FoodForm & ExerciseForm
   (tidak diubah dari format kamu — logic internal tetap)
   =========================== */
  function FoodForm ({
    onAdd,
    onCancel,
    addFoodToDatabase,
    mapMealTypeToKategori
  }) {
    const [name, setName] = useState('')
    const [calories, setCalories] = useState('')
    const [protein, setProtein] = useState('')
    const [carbs, setCarbs] = useState('')
    const [fat, setFat] = useState('')
    const [mealType, setMealType] = useState('snack')
    const [saveToDatabase, setSaveToDatabase] = useState(false)

    const handleSubmit = async () => {
      if (!name) return alert('Masukkan nama makanan')

      const foodData = {
        name,
        calories: toNumberSafe(calories),
        protein: toNumberSafe(protein),
        carbs: toNumberSafe(carbs),
        fat: toNumberSafe(fat)
      }

      if (saveToDatabase && addFoodToDatabase) {
        const kategori = mapMealTypeToKategori
          ? mapMealTypeToKategori(mealType)
          : 'camilan'
        const success = await addFoodToDatabase(foodData, kategori)
        if (success) {
          alert('Makanan berhasil disimpan ke database!')
        } else {
          alert('Gagal menyimpan makanan ke database')
        }
      }

      onAdd(foodData, mealType)
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={styles.label}>Nama Makanan</label>
          <input
            placeholder='Contoh: Nasi Goreng'
            value={name}
            onChange={e => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
          }}
        >
          <div>
            <label style={styles.label}>Waktu Makan</label>
            <select
              value={mealType}
              onChange={e => setMealType(e.target.value)}
              style={styles.inputField}
            >
              <option value='breakfast'>Sarapan</option>
              <option value='lunch'>Makan Siang</option>
              <option value='dinner'>Makan Malam</option>
              <option value='snack'>Camilan</option>
            </select>
          </div>
          <div>
            <label style={styles.label}>Kalori</label>
            <input
              placeholder='Kalori'
              value={calories}
              onChange={e => setCalories(e.target.value)}
              style={styles.inputField}
            />
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem'
          }}
        >
          <div>
            <label style={styles.label}>Protein (g)</label>
            <input
              placeholder='Protein'
              value={protein}
              onChange={e => setProtein(e.target.value)}
              style={styles.inputField}
            />
          </div>
          <div>
            <label style={styles.label}>Karbo (g)</label>
            <input
              placeholder='Karbohidrat'
              value={carbs}
              onChange={e => setCarbs(e.target.value)}
              style={styles.inputField}
            />
          </div>
          <div>
            <label style={styles.label}>Lemak (g)</label>
            <input
              placeholder='Lemak'
              value={fat}
              onChange={e => setFat(e.target.value)}
              style={styles.inputField}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            type='checkbox'
            id='saveToDatabase'
            checked={saveToDatabase}
            onChange={e => setSaveToDatabase(e.target.checked)}
          />
          <label
            htmlFor='saveToDatabase'
            style={{ ...styles.label, margin: 0, fontSize: '0.8rem' }}
          >
            Simpan makanan ini ke database
          </label>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              border: 'none',
              color: '#475569',
              fontWeight: '600'
            }}
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #247ba0 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Tambah
          </motion.button>
        </div>
      </div>
    )
  }

  function ExerciseForm ({ onAdd, onCancel }) {
    const [name, setName] = useState('')
    const [type, setType] = useState('cardio')
    const [calories, setCalories] = useState('')
    const [duration, setDuration] = useState('')

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          placeholder='Nama aktivitas'
          value={name}
          onChange={e => setName(e.target.value)}
          style={styles.input}
        />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ ...styles.inputField, flex: 1 }}
          >
            <option value='cardio'>Cardio</option>
            <option value='strength'>Strength</option>
            <option value='other'>Other</option>
          </select>
          <input
            placeholder='Kalori'
            value={calories}
            onChange={e => setCalories(e.target.value)}
            style={{ ...styles.inputField, width: 120 }}
          />
          <input
            placeholder='Durasi (mnt)'
            value={duration}
            onChange={e => setDuration(e.target.value)}
            style={{ ...styles.inputField, width: 120 }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end'
          }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
              border: 'none',
              color: '#475569',
              fontWeight: '600'
            }}
          >
            Batal
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!name) return alert('Masukkan nama aktivitas')
              onAdd({
                name,
                type,
                calories: toNumberSafe(calories),
                duration: toNumberSafe(duration),
                time: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })
              })
            }}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #247ba0 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: '600'
            }}
          >
            Tambah
          </motion.button>
        </div>
      </div>
    )
  }
  function MacroInfoTooltip () {
    return (
      <span
        onClick={() => setShowMacroInfoPopup(true)}
        style={{
          marginLeft: 8,
          cursor: 'pointer',
          fontSize: '0.9rem',
          color: '#64748b',
          userSelect: 'none'
        }}
      >
        ⓘ
      </span>
    )
  }

  function MacroBar ({ consumed, goal, type, color }) {
    const isOver = consumed > goal
    const percentage = Math.min((consumed / goal) * 100, 100)

    return (
      <div style={styles.macroItem}>
        <div style={styles.macroHeader}>
          <span
            style={{
              ...styles.macroName,
              color: isOver ? '#dc2626' : styles.macroName.color
            }}
          >
            {type}
          </span>
          <span
            style={{
              ...styles.macroAmount,
              color: isOver ? '#dc2626' : styles.macroAmount.color,
              fontWeight: isOver ? 700 : 600
            }}
          >
            {consumed}g / {goal}g
          </span>
        </div>

        <div style={styles.macroBar}>
          <div
            style={{
              ...styles.macroProgress,
              width: `${percentage}%`,
              background: isOver
                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                : color,
              boxShadow: isOver
                ? '0 0 0 3px rgba(239,68,68,0.25)'
                : styles.macroProgress.boxShadow
            }}
          />
        </div>

        {isOver && (
          <div
            style={{
              marginTop: 6,
              fontSize: '0.75rem',
              color: '#dc2626',
              fontWeight: 600
            }}
          >
            ⚠️ Melebihi batas harian
          </div>
        )}
      </div>
    )
  }
}
