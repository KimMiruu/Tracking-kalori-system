"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Pastikan server mengembalikan JSON
      if (res.headers.get("content-type")?.includes("text/html")) {
        throw new Error("Server mengembalikan HTML, bukan JSON");
      }

      const data = await res.json();

      if (res.ok && data.user) {
        console.log("Data dari API:", data);

        const userData = {
          id_user: data.user.id_user || data.user.id || null,
          nama: data.user.username || "",
          email: data.user.email || "",
          target_kalori: data.user.target_kalori || 2000,
        };

        if (!userData.id_user) {
          throw new Error("ID user tidak ditemukan dalam data login!");
        }

        // Simpan userData
        localStorage.setItem("userData", JSON.stringify(userData));
        localStorage.setItem("id_user", String(userData.id_user));
        localStorage.setItem("nama", userData.nama);
        localStorage.setItem("email", userData.email);

        // Simpan target kalori
        localStorage.setItem(
          `targetKalori_${userData.id_user}`,
          String(userData.target_kalori)
        );

        // 🔥 Restore tracking hari ini supaya tidak reset
if (data.tracking) {
  localStorage.setItem(
    `simplefit_${userData.id_user}_${new Date().toISOString().split("T")[0]}`,
    JSON.stringify({
      calories: {
        consumed: data.tracking.kalori_dikonsumsi || 0,
        burned: data.tracking.kalori_dibakar || 0,
      },
      water: data.tracking.air || 0,
      macros: {
        protein: { consumed: data.tracking.protein || 0, burned: 0 },
        carbs: { consumed: data.tracking.karbohidrat || 0, burned: 0 },
        fat: { consumed: data.tracking.lemak || 0, burned: 0 },
      },
      meals: data.tracking.detail_makanan ? JSON.parse(data.tracking.detail_makanan) : [],
      exercises: data.tracking.detail_aktivitas ? JSON.parse(data.tracking.detail_aktivitas) : [],
    })
  );
}


        // ❌ Dulu di sini ada backup tracking yang menyebabkan RESET
        // ❗ Sudah dihapus total. Login tidak boleh mengubah tracking.

        setMessage("Login berhasil!");

        // Redirect setelah sedikit delay
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        setMessage(`❌ ${data.message || "Email atau password salah"}`);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Terjadi kesalahan saat login: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.bubble1}></div>
        <div style={styles.bubble2}></div>
        <div style={styles.bubble3}></div>
      </div>

      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💪</div>
          <h1 style={styles.title}>SimpleFit</h1>
        </div>

        <p style={styles.subtitle}>Masuk ke akun Anda</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Sandi</label>
            <input
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(isLoading ? styles.buttonLoading : {}),
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                Memproses...
              </div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <a href="/forgot-password" style={styles.link}>
            Lupa kata sandi?
          </a>
          <p style={styles.signup}>
            Belum punya akun?{" "}
            <a href="/register" style={styles.link}>
              Daftar sekarang
            </a>
          </p>
        </div>

        {message && (
          <div
            style={{
              ...styles.message,
              ...(message.includes("❌") || message.includes("⚠️")
                ? styles.messageError
                : styles.messageSuccess),
            }}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

// Styling tetap sama dengan milikmu
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background:
      "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  bubble1: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(168, 230, 207, 0.3)",
    animation: "float 6s ease-in-out infinite",
  },
  bubble2: {
    position: "absolute",
    top: "60%",
    right: "10%",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(112, 193, 179, 0.25)",
    animation: "float 8s ease-in-out infinite 1s",
  },
  bubble3: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "rgba(36, 123, 160, 0.2)",
    animation: "float 7s ease-in-out infinite 2s",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    padding: "48px 40px",
    borderRadius: "20px",
    boxShadow:
      "0 20px 40px rgba(36, 123, 160, 0.15), 0 0 0 1px rgba(255,255,255,0.3)",
    textAlign: "center",
    width: "100%",
    maxWidth: "420px",
    zIndex: 10,
    border: "1px solid rgba(255,255,255,0.4)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    marginBottom: "8px",
  },
  logoIcon: {
    fontSize: "32px",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: 0,
  },
  subtitle: {
    color: "#5a6c7d",
    fontSize: "16px",
    marginBottom: "32px",
    fontWeight: "400",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    textAlign: "left",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#2d3748",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #cbd5e0",
    fontSize: "16px",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
    backgroundColor: "white",
    color: "#000",
  },
  button: {
    background: "linear-gradient(135deg, #70c1b3 0%, #247ba0 100%)",
    color: "white",
    padding: "16px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(36, 123, 160, 0.3)",
  },
  buttonLoading: {
    opacity: 0.8,
    cursor: "not-allowed",
  },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid transparent",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  footer: {
    marginTop: "32px",
    paddingTop: "24px",
    borderTop: "1px solid #e2e8f0",
  },
  link: {
    color: "#247ba0",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "color 0.2s ease",
  },
  signup: {
    marginTop: "12px",
    fontSize: "14px",
    color: "#5a6c7d",
  },
  message: {
    marginTop: "20px",
    padding: "12px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
  },
  messageSuccess: {
    backgroundColor: "#c6f6d5",
    color: "#22543d",
    border: "1px solid #9ae6b4",
  },
  messageError: {
    backgroundColor: "#fed7d7",
    color: "#742a2a",
    border: "1px solid #feb2b2",
  },
};

// Inject CSS animation
const stylesheet = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  input:focus {
    outline: none;
    border-color: #70c1b3 !important;
    box-shadow: 0 0 0 3px rgba(112, 193, 179, 0.1);
  }
  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(36, 123, 160, 0.4);
  }
  a:hover {
    color: #70c1b3;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = stylesheet;
  document.head.appendChild(styleSheet);
}
