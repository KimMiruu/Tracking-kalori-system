"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Chatbot from "@/components/Chatbot";


export default function Dashboard() {
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [currentTime, setCurrentTime] = useState("");
  const [greeting, setGreeting] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateTimeAndGreeting = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setCurrentTime(timeString);

      const hour = now.getHours();
      let newGreeting = "";
      if (hour < 12) newGreeting = "Pagi";
      else if (hour < 15) newGreeting = "Siang";
      else if (hour < 18) newGreeting = "Sore";
      else newGreeting = "Malam";

      setGreeting(newGreeting);
    };

    window.addEventListener("scroll", handleScroll);
    updateTimeAndGreeting();
    const timer = setInterval(updateTimeAndGreeting, 60000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearInterval(timer);
    };
  }, []);

  // Fetch dashboard data berdasarkan id_user di localStorage
  useEffect(() => {
    const id_user = typeof window !== "undefined" ? localStorage.getItem("id_user") : null;

    if (!id_user) {
      // jika tidak ada id_user, arahkan ke halaman login
      router.push("/login");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setFetchError(null);

    fetch(`/api/dashboard?id_user=${encodeURIComponent(id_user)}`, { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `HTTP ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // <<< LOG DATA DARI API (untuk debugging) >>>
        console.log("RESP API /api/dashboard:", data);

        // jika API mengikuti struktur { success: true, user, tracking, recentActivities }
        if (data && (data.user || data.success)) {
          setDashboardData(data);
        } else {
          setFetchError("Data dashboard tidak valid dari server.");
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Gagal fetch dashboard:", err);
          // juga tampilkan error response kalau ada
          console.log("Fetch error detail:", err.message || err);
          setFetchError(err.message || "Gagal mengambil data dashboard");
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [router]);

  const handleLogout = () => {
    // hapus localStorage dan redirect
    localStorage.removeItem("id_user");
    localStorage.removeItem("userData");
    localStorage.removeItem("nama");
    localStorage.removeItem("email");
    router.push("/login");
  };

  // Helper: Progress circle component (dipakai di streak)
  const ProgressCircle = ({ percentage, color, size = 60 }) => {
    const radius = (size - 8) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="4"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color || "white"}
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "white",
            fontSize: "0.75rem",
            fontWeight: "600",
          }}
        >
          {percentage}%
        </div>
      </div>
    );
  };

  // Jika masih loading
  if (loading) {
    return (
      <div style={{ padding: 40, fontFamily: styles.container.fontFamily }}>
        <p style={{ color: "#374151", fontSize: 18 }}>Loading dashboard...</p>
      </div>
    );
  }

  // Jika error fetch
  if (fetchError) {
    return (
      <div style={{ padding: 40, fontFamily: styles.container.fontFamily }}>
        <p style={{ color: "#b91c1c", fontSize: 16, marginBottom: 12 }}>Gagal memuat dashboard:</p>
        <pre style={{ background: "#fff", padding: 12, borderRadius: 8, color: "#111" }}>{String(fetchError)}</pre>
        <div style={{ marginTop: 12 }}>
          <button onClick={() => location.reload()} style={styles.button}>
            Muat ulang
          </button>
        </div>
      </div>
    );
  }

  // Ambil variabel dari dashboardData (digunakan jika API mengikuti struktur yang kuberikan)
  const apiUser = dashboardData?.user ?? null;
  const tracking = dashboardData?.tracking ?? null;

  // ===== Normalisasi recentActivities =====
  const normalizeActivities = (raw) => {
    if (!raw) return [];

    // string JSON -> parse
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
        if (typeof parsed === "object") return [parsed];
        return [];
      } catch {
        return [];
      }
    }

    // array -> return langsung (filter out empty objects)
    if (Array.isArray(raw)) {
      return raw.filter((it) => {
        // keep only if has some meaningful prop
        if (!it) return false;
        if (typeof it === "object") {
          return Boolean(it.name || it.activity || it.title || it.tanggal || it.time || Object.keys(it).length > 0);
        }
        return false;
      });
    }

    // object -> wrap in array
    if (typeof raw === "object") {
      return [raw];
    }

    return [];
  };

  const recentFromApi = normalizeActivities(dashboardData?.recentActivities);
  const recentFromTrack = normalizeActivities(tracking?.detail_aktivitas);
  const recentActivities = recentFromApi.length > 0 ? recentFromApi : recentFromTrack;

  // Buat stats dinamis berdasarkan data
  const targetKalori = apiUser?.target_kalori ?? 2000;
  const kaloriDikonsumsi = tracking?.kalori_dikonsumsi ?? 0;
  const kaloriDibakar = tracking?.kalori_dibakar ?? 0;
  const air = tracking?.air ?? 0;

  // Safely compute percents (pastikan tidak dibagi 0)
  const percentOfTarget = targetKalori ? Math.round((kaloriDikonsumsi / targetKalori) * 100) : 0;

  // Stats array (digunakan di UI sama seperti sebelumnya)
  const stats = [
    {
      icon: "🔥",
      value: `${Math.round(kaloriDikonsumsi)}`,
      label: "Kalori Dikonsumsi",
      color: "#ef4444",
      progress: Math.min(percentOfTarget || 0, 100),
      target: targetKalori,
    },
    {
      icon: "💪",
      value: `${Math.round(kaloriDibakar)} cal`,
      label: "Kalori Dibakar",
      color: "#3b82f6",
      progress: Math.min(Math.round((kaloriDibakar / Math.max(1, 500)) * 100) || 0, 100),
      target: "500",
    },
    {
      icon: "💧",
      value: `${air} L`,
      label: "Air",
      color: "#06b6d4",
      progress: Math.min(Math.round((air / 2) * 100) || 0, 100),
      target: "2L",
    },
    {
      icon: "🎯",
      value: `${recentActivities.length}`,
      label: "Aktivitas Hari Ini",
      color: "#f59e0b",
      progress: Math.min(Math.round((recentActivities.length / 6) * 100) || 0, 100), // asumsi target 6 aktivitas
      target: "6",
    },
  ];

  // Streak basic: kalau ada tracking hari ini, beri 1; (kamu bisa ganti dengan perhitungan streak dari API)
  const streakCount = tracking ? 1 : 0;
  const streakPercent = Math.min(Math.round((kaloriDikonsumsi / Math.max(1, targetKalori)) * 100) || 0, 100);

  // progressSummary mapping (gunakan fallback bila API belum kirim)
  const progressSummary = dashboardData?.progressSummary ?? {
    activeDays: dashboardData?.active_days ?? dashboardData?.activeDays ?? 0,
    consistency:
      dashboardData?.consistency ??
      dashboardData?.consistency_pct ??
      Math.min(percentOfTarget, 100),
    improving: dashboardData?.performance_improving ?? dashboardData?.progressSummary?.improving ?? false,
    totalDays: dashboardData?.progressSummary?.totalDays ?? 7,
    caloriesPeriod: dashboardData?.progressSummary?.caloriesPeriod ?? Math.round(kaloriDikonsumsi + kaloriDibakar),
  };

  return (
    <div style={styles.container}>
      {/* Main Content */}
      <main style={styles.mainContent}>
        <div style={styles.contentContainer}>
          {/* Welcome Section */}
          <div style={styles.welcomeSection}>
            <div style={styles.welcomeContent}>
              <div style={styles.welcomeText}>
                <div style={styles.greeting}>
                  <h1 style={styles.welcomeTitle}>
                    Selamat <span style={styles.greetingText}>{greeting}</span>,{" "}
                    <span style={styles.userName}>{apiUser?.username || "User"}</span> 👋
                  </h1>
                  <p style={styles.welcomeSubtitle}>Mari capai tujuan fitness Anda hari ini. Progress Anda luar biasa!</p>
                </div>

                <div style={styles.streakContainer}>
                  <div style={styles.streakCard}>
                    <div style={styles.streakIcon}>🔥</div>
                    <div style={styles.streakInfo}>
                      <div style={styles.streakCount}>{streakCount}</div>
                      <div style={styles.streakLabel}>Hari Beruntun</div>
                    </div>
                    <div style={styles.streakProgress}>
                      <ProgressCircle percentage={streakPercent} size={50} color={"#fff"} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div style={styles.statsSection}>
            <h2 style={styles.sectionTitle}>Statistik Hari Ini</h2>
            <div style={styles.statsGrid}>
              {stats.map((stat, index) => (
                <div key={index} style={styles.statCard}>
                  <div style={styles.statHeader}>
                    <div
                      style={{
                        ...styles.statIcon,
                        background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}10)`,
                      }}
                    >
                      <span style={{ color: stat.color, fontSize: "1.5rem" }}>{stat.icon}</span>
                    </div>
                    <div style={styles.statInfo}>
                      <div style={styles.statValue}>{stat.value}</div>
                      <div style={styles.statLabel}>{stat.label}</div>
                    </div>
                  </div>
                  <div style={styles.statProgress}>
                    <div style={styles.progressBar}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${stat.progress}%`,
                          backgroundColor: stat.color,
                        }}
                      />
                    </div>
                    <span style={styles.progressText}>
                      {stat.progress}% dari {stat.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={styles.actionsSection}>
            <h2 style={styles.sectionTitle}>Aksi Cepat</h2>
            <div style={styles.actionsGrid}>
              <Link href="/dashboard/tracking" style={{ ...styles.actionCard, background: "linear-gradient(135deg, #247ba0 0%, #1a5a7a 100%)" }}>
                <div style={styles.actionContent}>
                  <div style={styles.actionIcon}>
                    <span style={styles.actionIconText}>📝</span>
                  </div>
                  <div style={styles.actionInfo}>
                    <h3 style={styles.actionTitle}>Tracking Makanan</h3>
                    <p style={styles.actionDescription}>Catat asupan kalori harian</p>
                  </div>
                  <div style={styles.actionArrow}>
                    <span style={styles.arrowIcon}>→</span>
                  </div>
                </div>
                <div style={styles.actionHoverEffect}></div>
              </Link>

              <Link href="/dashboard/workout" style={{ ...styles.actionCard, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
                <div style={styles.actionContent}>
                  <div style={styles.actionIcon}>
                    <span style={styles.actionIconText}>💪</span>
                  </div>
                  <div style={styles.actionInfo}>
                    <h3 style={styles.actionTitle}>Mulai Latihan</h3>
                    <p style={styles.actionDescription}>Pilih program latihan</p>
                  </div>
                  <div style={styles.actionArrow}>
                    <span style={styles.arrowIcon}>→</span>
                  </div>
                </div>
                <div style={styles.actionHoverEffect}></div>
              </Link>

              <Link href="/dashboard/food" style={{ ...styles.actionCard, background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
                <div style={styles.actionContent}>
                  <div style={styles.actionIcon}>
                    <span style={styles.actionIconText}>🍎</span>
                  </div>
                  <div style={styles.actionInfo}>
                    <h3 style={styles.actionTitle}>Rekomendasi Makan</h3>
                    <p style={styles.actionDescription}>Temukan makanan sehat</p>
                  </div>
                  <div style={styles.actionArrow}>
                    <span style={styles.arrowIcon}>→</span>
                  </div>
                </div>
                <div style={styles.actionHoverEffect}></div>
              </Link>

              <Link href="/dashboard/progress" style={{ ...styles.actionCard, background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}>
                <div style={styles.actionContent}>
                  <div style={styles.actionIcon}>
                    <span style={styles.actionIconText}>📈</span>
                  </div>
                  <div style={styles.actionInfo}>
                    <h3 style={styles.actionTitle}>Lihat Progress</h3>
                    <p style={styles.actionDescription}>Pantau perkembangan</p>
                  </div>
                  <div style={styles.actionArrow}>
                    <span style={styles.arrowIcon}>→</span>
                  </div>
                </div>
                <div style={styles.actionHoverEffect}></div>
              </Link>
            </div>
          </div>

          {/* Recent Activities (FULL WIDTH) */}
          <div style={{ ...styles.gridSection, gridTemplateColumns: "1fr", gap: "0" }}>
            <div style={styles.recentSection}>
              <div style={styles.sectionHeader}>
                <h2 style={styles.sectionTitle}>Aktivitas Terbaru</h2>
                <Link href="/dashboard/tracking" style={styles.viewAllButton}>
                  Lihat Semua →
                </Link>
              </div>

              <div style={styles.activitiesList}>
                {(!recentActivities || recentActivities.length === 0) ? (
                  <div style={{ padding: 12, color: "#64748b" }}>Belum ada aktivitas hari ini.</div>
                ) : (
                  recentActivities.map((activity, index) => {
                    // activity bisa berbagai bentuk; kita normalisasi akses properti
                    const act = activity || {};
                    const first = Array.isArray(act) ? (act[0] || {}) : act;

                    const name = (first && (first.name || first.activity || first.title || first.judul)) || "Aktivitas";
                    const time = (first && (first.time || first.tanggal || first.created_at || first.date)) || "-";
                    const caloriesValue = (first && (first.calories ?? first.kalori ?? first.cal ?? null));

                    let type = "other";
                    if (first && first.type) type = first.type;
                    else if (first && first.category) {
                      if (first.category === "exercise") type = "exercise";
                      if (first.category === "food") type = "food";
                    }

                    return (
                      <div key={index} style={styles.activityItem}>
                        <div
                          style={{
                            ...styles.activityIcon,
                            backgroundColor:
                              type === "exercise" ? "#dbeafe" :
                              type === "food" ? "#f0fdf4" : "#f0f9ff",
                          }}
                        >
                          <span style={{ color: type === "exercise" ? "#3b82f6" : type === "food" ? "#10b981" : "#06b6d4" }}>
                            {first && first.icon ? first.icon : (type === "food" ? "🍎" : "🏃")}
                          </span>
                        </div>

                        <div style={styles.activityInfo}>
                          <div style={styles.activityName}>{name}</div>
                          <div style={styles.activityTime}>{time}</div>
                        </div>

                        <div style={styles.activityCalories}>
                          {caloriesValue !== null && caloriesValue !== undefined && caloriesValue !== "-" ? (
                            <span style={styles.calorieBadge}>{String(caloriesValue)}</span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Motivation (footer) - now connected to API via progressSummary */}
          <div style={styles.motivationSection}>
            <div style={styles.motivationCard}>
              <div style={styles.motivationContent}>
                <div style={styles.motivationIcon}>💪</div>
                <div style={styles.motivationText}>
                  <h3 style={styles.motivationTitle}>Tetap Semangat!</h3>
                  <p style={styles.motivationDescription}>
                    Konsistensi adalah kunci kesuksesan. Setiap langkah kecil membawa Anda lebih dekat ke tujuan. Anda sudah melakukan {percentOfTarget}% dari target hari ini!
                  </p>
                </div>
              </div>

              <div style={styles.motivationStats}>
                <div style={styles.motivationStat}>
                  <span style={styles.statNumber}>{progressSummary.activeDays}</span>
                  <span style={styles.statLabel}>Hari Aktif</span>
                </div>
                <div style={styles.motivationStat}>
                  <span style={styles.statNumber}>{progressSummary.consistency}%</span>
                  <span style={styles.statLabel}>Consistency</span>
                </div>
                <div style={styles.motivationStat}>
                  <span style={styles.statNumber}>{tracking?.berat_badan_diff ?? "—"}</span>
                  <span style={styles.statLabel}>Perubahan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
        <Chatbot />
    </div>
  );
}

/* ---------- Styles (sama seperti milikmu, tidak berubah) ---------- */
const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
  },
  mainContent: {
    marginTop: "80px",
    minHeight: "calc(100vh - 80px)",
    padding: "2rem 1rem",
  },
  contentContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  welcomeSection: {
    marginBottom: "3rem",
  },
  welcomeContent: {
    background: "linear-gradient(135deg, #20c997 0%, #247ba0 50%, #1a5a7a 100%)",
    borderRadius: "20px",
    padding: "3rem",
    boxShadow: "0 20px 60px rgba(32, 201, 151, 0.2)",
    position: "relative",
    overflow: "hidden",
  },
  welcomeText: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  greeting: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: "3rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.5rem",
    lineHeight: 1.1,
  },
  greetingText: {
    color: "white",
    fontWeight: "800",
  },
  userName: {
    color: "white",
    fontWeight: "800",
  },
  welcomeSubtitle: {
    fontSize: "1.25rem",
    color: "rgba(255, 255, 255, 0.9)",
    maxWidth: "500px",
    lineHeight: 1.5,
  },
  streakContainer: {
    flex: "0 0 auto",
  },
  streakCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.5rem",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  streakIcon: {
    fontSize: "2.5rem",
  },
  streakInfo: {
    textAlign: "center",
  },
  streakCount: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.25rem",
  },
  streakLabel: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },

  statsSection: {
    marginBottom: "3rem",
  },
  sectionTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "1.5rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  statCard: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    transition: "all 0.3s ease",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "1rem",
  },
  statIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "500",
  },

  progressBar: {
    width: "100%",
    height: "6px",
    backgroundColor: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "0.75rem",
    color: "#64748b",
  },

  actionsSection: {
    marginBottom: "3rem",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  actionCard: {
    borderRadius: "16px",
    padding: "1.5rem",
    textDecoration: "none",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
  },
  actionContent: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    position: "relative",
    zIndex: 2,
  },
  actionIcon: {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconText: {
    fontSize: "1.5rem",
    color: "white",
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: "1.125rem",
    fontWeight: "600",
    color: "white",
    marginBottom: "0.25rem",
  },
  actionDescription: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.8)",
  },

  gridSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2rem",
    marginBottom: "3rem",
  },
  recentSection: {
    backgroundColor: "white",
    padding: "1.5rem",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  activitiesList: {
    spaceY: "1rem",
  },
  activityItem: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem",
    borderRadius: "12px",
    transition: "all 0.3s ease",
  },
  activityIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: "0.25rem",
  },
  activityTime: {
    fontSize: "0.75rem",
    color: "#64748b",
  },
  activityCalories: {
    flex: "0 0 auto",
  },
  calorieBadge: {
    padding: "0.25rem 0.75rem",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },

  motivationSection: {
    marginBottom: "2rem",
  },
  motivationCard: {
    background: "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 100%)",
    padding: "2.5rem",
    borderRadius: "20px",
    boxShadow: "0 20px 60px rgba(112, 193, 179, 0.2)",
  },
  motivationContent: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  motivationIcon: {
    fontSize: "3.5rem",
    flexShrink: 0,
  },
  motivationText: {
    flex: 1,
  },
  motivationTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.5rem",
  },
  motivationDescription: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 1.5,
  },
  motivationStats: {
    display: "flex",
    gap: "2rem",
  },
  motivationStat: {
    textAlign: "center",
  },
  statNumber: {
    display: "block",
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "white",
    marginBottom: "0.25rem",
  },
  statLabel: {
    fontSize: "0.875rem",
    color: "rgba(255, 255, 255, 0.8)",
  },

  /* small added button style so reload button won't cause undefined style access */
  button: {
    background: "linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)",
    color: "white",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};

// Inject CSS animations & small helpers (sama seperti milikmu, tidak berubah)
const stylesheet = `
  .profile-dropdown:hover .dropdown-menu {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  }

  .profile-button:hover {
    background-color: rgba(36, 123, 160, 0.1);
  }

  .menu-link:hover {
    color: #247ba0;
    background-color: rgba(36, 123, 160, 0.1);
    transform: translateY(-1px);
  }

  .dropdown-item:hover {
    background-color: #f8fafc;
    color: #247ba0;
  }

  .action-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
  }

  .activity-item:hover {
    background-color: #f8fafc;
    transform: translateX(4px);
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; padding: 0; }

  @keyframes float {
    0%,100%{ transform: translateY(0); } 50%{ transform: translateY(-6px); }
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = stylesheet;
  document.head.appendChild(styleSheet);
}