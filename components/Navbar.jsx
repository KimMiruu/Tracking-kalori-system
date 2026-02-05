'use client'

import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useUser } from '@/app/context/UserContext'

export default function Navbar () {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const { user, setUser } = useUser() // Context Global User

  const [isScrolled, setIsScrolled] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isFoodDropdownOpen, setIsFoodDropdownOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState('dashboard')

  const activeFoodTab = searchParams?.get('tab') || 'rekomendasi'

  // ref untuk click-outside dropdown makanan
  const foodDropdownRef = useRef(null)

  /* 1️⃣ Scroll Effect */
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  /* 2️⃣ Set Menu Aktif berdasarkan pathname */
  useEffect(() => {
    const path = pathname?.split('/')[2] || 'dashboard'
    setActiveMenu(path)
  }, [pathname])

  /* 3️⃣ Load user dari localStorage → Context */
  useEffect(() => {
    const savedUser = localStorage.getItem('userData')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)

        setUser({
          nama: parsed.nama || parsed.username || 'User',
          email: parsed.email || 'user@example.com'
        })
      } catch (err) {
        console.error('Gagal parse userData:', err)
      }
    }
  }, [setUser])

  /* 4️⃣ Logout Handler */
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' })

      setUser(null)
      localStorage.clear()

      router.push('/login')
    } catch (err) {
      alert('Logout gagal, coba lagi.')
    }
  }

  const toggleDropdown = () => setIsDropdownOpen(prev => !prev)
  const toggleFoodDropdown = () => setIsFoodDropdownOpen(prev => !prev)

  // ✅ Click-outside untuk dropdown makanan
  useEffect(() => {
    if (!isFoodDropdownOpen) return

    const handleClickOutside = event => {
      if (
        foodDropdownRef.current &&
        !foodDropdownRef.current.contains(event.target)
      ) {
        setIsFoodDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isFoodDropdownOpen])

  return (
    <nav
      style={{
        ...styles.nav,
        ...(isScrolled ? styles.navScrolled : {})
      }}
    >
      <div style={styles.navContent}>
        {/* LOGO */}
        <div style={styles.logoSection}>
          <Link href='/dashboard' style={styles.logo}>
            <img
              src='/logo1.png'
              alt='SimpleFit Logo'
              style={styles.logoImage}
            />
          </Link>
        </div>

        {/* NAV MENU */}
        <div style={styles.menuSection}>
          {[
            {
              href: '/dashboard',
              icon: '🏠',
              label: 'Dashboard',
              key: 'dashboard'
            },
            {
              href: '/dashboard/tracking',
              icon: '📊',
              label: 'Tracking',
              key: 'tracking'
            },
            {
              href: '/dashboard/workout',
              icon: '💪',
              label: 'Latihan',
              key: 'workout'
            },
            {
              href: '/dashboard/food',
              icon: '🍎',
              label: 'Makanan',
              key: 'food'
            },
            {
              href: '/dashboard/progress',
              icon: '📈',
              label: 'Progress',
              key: 'progress'
            }
          ].map(menu => {
            // 🔸 Item khusus: Makanan → punya sub menu
            if (menu.key === 'food') {
              const isActive = activeMenu === 'food'

              return (
                <div
                  key={menu.key}
                  style={styles.foodDropdownWrapper}
                  ref={foodDropdownRef} // ✅ supaya click-outside berfungsi
                >
                  <button
                    type='button'
                    onClick={() => {
                      // hanya buka/tutup dropdown, tidak pindah halaman
                      toggleFoodDropdown()
                    }}
                    style={{
                      ...styles.menuLink,
                      ...(isActive ? styles.menuLinkActive : {})
                    }}
                  >
                    <span style={styles.menuIcon}>{menu.icon}</span>
                    {menu.label}
                    <span style={styles.foodDropdownArrow}>▾</span>
                    {isActive && <div style={styles.activeIndicator}></div>}
                  </button>

                  {isFoodDropdownOpen && (
                    <div style={styles.foodDropdownMenu}>
                      <Link
                        href='/dashboard/food?tab=rekomendasi'
                        style={{
                          ...styles.foodDropdownItem,
                          ...(activeFoodTab === 'rekomendasi'
                            ? styles.foodDropdownItemActive
                            : {})
                        }}
                        onClick={() => setIsFoodDropdownOpen(false)}
                      >
                        Rekomendasi Makanan
                      </Link>
                      <Link
                        href='/dashboard/food?tab=menu'
                        style={{
                          ...styles.foodDropdownItem,
                          ...(activeFoodTab === 'menu'
                            ? styles.foodDropdownItemActive
                            : {})
                        }}
                        onClick={() => setIsFoodDropdownOpen(false)}
                      >
                        Menu Makanan
                      </Link>
                    </div>
                  )}
                </div>
              )
            }

            // 🔹 Item menu biasa
            return (
              <Link
                key={menu.key}
                href={menu.href}
                style={{
                  ...styles.menuLink,
                  ...(activeMenu === menu.key ? styles.menuLinkActive : {})
                }}
                onClick={() => setActiveMenu(menu.key)}
              >
                <span style={styles.menuIcon}>{menu.icon}</span>
                {menu.label}
                {activeMenu === menu.key && (
                  <div style={styles.activeIndicator}></div>
                )}
              </Link>
            )
          })}
        </div>

        {/* PROFILE DROPDOWN */}
        <div style={styles.profileSection}>
          <div style={styles.profileDropdown}>
            <button
              style={{
                ...styles.profileButton,
                ...(isDropdownOpen ? styles.profileButtonActive : {})
              }}
              onClick={toggleDropdown}
              onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
            >
              <div style={styles.profileAvatar}>
                <span style={styles.avatarText}>
                  {user?.nama?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span style={styles.profileName}>{user?.nama || 'User'}</span>
              <span
                style={{
                  ...styles.dropdownArrow,
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              >
                ▼
              </span>
            </button>

            {isDropdownOpen && (
              <div style={styles.dropdownMenu}>
                <div style={styles.dropdownHeader}>
                  <div style={styles.dropdownAvatar}>
                    <span style={styles.avatarText}>
                      {user?.nama?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <div style={styles.dropdownUserName}>
                      {user?.nama || 'User'}
                    </div>
                    <div style={styles.dropdownUserEmail}>
                      {user?.email || 'user@example.com'}
                    </div>
                  </div>
                </div>

                <div style={styles.dropdownDivider}></div>

                <Link href='/dashboard/profile' style={styles.dropdownItem}>
                  <span style={styles.dropdownIcon}>👤</span>
                  <div>
                    <div>Profil Saya</div>
                    <div style={styles.dropdownSubtext}>Kelola profil Anda</div>
                  </div>
                </Link>

                <Link href='/dashboard/settings' style={styles.dropdownItem}>
                  <span style={styles.dropdownIcon}>⚙️</span>
                  <div>
                    <div>Pengaturan</div>
                    <div style={styles.dropdownSubtext}>
                      Preferensi aplikasi
                    </div>
                  </div>
                </Link>

                <div style={styles.dropdownDivider}></div>

                <button onClick={handleLogout} style={styles.dropdownItem}>
                  <span style={styles.dropdownIcon}>🚪</span>
                  <div>
                    <div>Keluar</div>
                    <div style={styles.dropdownSubtext}>Amankan akun Anda</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

/* -------------------------------------------
  STYLES
------------------------------------------- */

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    padding: '0.75rem 0',
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
    zIndex: 1000,
    transition: 'all 0.3s ease',
    minHeight: '75px',
    display: 'flex'
  },
  navScrolled: {
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
    padding: '0.5rem 0'
  },
  navContent: {
    maxWidth: '1280px',
    margin: '0 auto',
    width: '100%',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none'
  },
  logoImage: { width: 160, height: 50, objectFit: 'contain' },

  /* Menu */
  menuSection: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    background: 'rgba(241, 245, 249, 0.6)',
    padding: '0.5rem',
    borderRadius: '16px'
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    borderRadius: '12px',
    textDecoration: 'none',
    color: '#64748b',
    transition: '0.2s',
    position: 'relative',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer'
  },
  menuLinkActive: {
    color: '#1e293b',
    background: 'white',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
  },
  activeIndicator: {
    position: 'absolute',
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 20,
    height: 3,
    background: 'linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)',
    borderRadius: '2px'
  },
  menuIcon: {
    fontSize: '1rem'
  },

  /* Sub menu Makanan */
  foodDropdownWrapper: {
    position: 'relative'
  },
  foodDropdownArrow: {
    fontSize: '0.75rem',
    marginLeft: 4
  },
  foodDropdownMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 14px 40px rgba(15,23,42,0.16)',
    padding: '0.5rem 0',
    minWidth: 200,
    zIndex: 1100
  },
  foodDropdownItem: {
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    textDecoration: 'none',
    color: '#475569',
    display: 'block'
  },
  foodDropdownItemActive: {
    background: 'rgba(34,197,94,0.08)',
    color: '#16a34a',
    fontWeight: 500
  },

  /* Profile Dropdown (tetap sama) */
  profileSection: {
    display: 'flex',
    alignItems: 'center'
  },
  profileDropdown: { position: 'relative' },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.625rem 1rem',
    borderRadius: '14px',
    background: 'white',
    border: '1px solid rgba(226,232,240,0.8)',
    cursor: 'pointer'
  },
  profileButtonActive: {
    boxShadow: '0 10px 30px rgba(15,23,42,0.18)'
  },
  profileAvatar: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff',
    fontWeight: 700
  },
  avatarText: {
    fontSize: '1rem'
  },
  profileName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#0f172a'
  },
  dropdownArrow: {
    fontSize: '0.7rem',
    color: '#64748b'
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: '#fff',
    borderRadius: '18px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    padding: '1rem 0',
    minWidth: 280,
    animation: 'dropdownSlide 0.2s ease'
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0 1.25rem 0.75rem'
  },
  dropdownAvatar: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #70c1b3, #247ba0)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#fff'
  },
  dropdownUserName: {
    fontWeight: 600
  },
  dropdownUserEmail: {
    fontSize: '0.8rem',
    color: '#64748b'
  },
  dropdownItem: {
    padding: '0.875rem 1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    textDecoration: 'none',
    color: '#374151',
    cursor: 'pointer',
    width: '100%',
    background: 'transparent',
    border: 'none',
    textAlign: 'left'
  },
  dropdownIcon: {
    fontSize: '1rem'
  },
  dropdownSubtext: {
    fontSize: '0.75rem',
    color: '#9ca3af'
  },
  dropdownDivider: {
    height: '1px',
    background: 'rgba(226,232,240,0.8)',
    margin: '0.75rem 0'
  }
}
