"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    usia: "",
    berat: "",
    tinggi: "",
    jenis_kelamin: "",
    target_kalori: "",
  });

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("⏳ Sedang memproses...");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Registrasi berhasil! Mengarahkan ke halaman login...");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setMessage(`❌ ${data.message || "Registrasi gagal."}`);
      }
    } catch (error) {
      setMessage("⚠️ Gagal menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.bubble1}></div>
        <div style={styles.bubble2}></div>
      </div>

      <div style={styles.card}>
        <h1 style={styles.title}>✨ Daftar Akun SimpleFit</h1>
        <p style={styles.subtitle}>Mulai perjalanan hidup sehatmu hari ini!</p>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.grid}>
            <input name="username" placeholder="Username" onChange={handleChange} required style={styles.input} />
            <input name="email" type="email" placeholder="Email" onChange={handleChange} required style={styles.input} />
            <input name="password" type="password" placeholder="Kata Sandi" onChange={handleChange} required style={styles.input} />
            <input name="usia" type="number" placeholder="Usia" onChange={handleChange} style={styles.input} />
            <input name="berat" type="number" placeholder="Berat (kg)" step="0.1" onChange={handleChange} style={styles.input} />
            <input name="tinggi" type="number" placeholder="Tinggi (cm)" step="0.1" onChange={handleChange} style={styles.input} />
            <select name="jenis_kelamin" onChange={handleChange} style={styles.input}>
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Pria">Pria</option>
              <option value="Wanita">Wanita</option>
            </select>
            <input name="target_kalori" type="number" placeholder="Target Kalori (kcal)" onChange={handleChange} style={styles.input} />
          </div>

          <button type="submit" style={styles.button} disabled={isLoading}>
            {isLoading ? "⏳ Memproses..." : "🚀 Daftar Sekarang"}
          </button>
        </form>

        {message && (
          <p
            style={{
              ...styles.message,
              ...(message.includes("✅") ? styles.success : styles.error),
            }}
          >
            {message}
          </p>
        )}

        <p style={styles.footerText}>
          Sudah punya akun?{" "}
          <a href="/login" style={styles.link}>
            Masuk di sini
          </a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)",
    fontFamily: "'Inter', sans-serif",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },
  bubble1: {
    position: "absolute",
    top: "15%",
    left: "15%",
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    background: "rgba(168, 230, 207, 0.3)",
    animation: "float 6s ease-in-out infinite",
  },
  bubble2: {
    position: "absolute",
    bottom: "10%",
    right: "20%",
    width: "180px",
    height: "180px",
    borderRadius: "50%",
    background: "rgba(36, 123, 160, 0.25)",
    animation: "float 8s ease-in-out infinite",
  },
  card: {
    position: "relative",
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "40px 36px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 15px 40px rgba(36,123,160,0.15)",
  },
  title: {
    textAlign: "center",
    fontSize: "26px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #70c1b3, #247ba0)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "8px",
  },
  subtitle: {
    textAlign: "center",
    color: "#5a6c7d",
    fontSize: "15px",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e0",
    fontSize: "15px",
    backgroundColor: "white",
    color: "#000",
    boxSizing: "border-box",
    transition: "all 0.2s ease",
  },
  button: {
    background: "linear-gradient(135deg, #70c1b3, #247ba0)",
    color: "white",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  message: {
    marginTop: "16px",
    padding: "10px",
    borderRadius: "8px",
    fontSize: "14px",
    textAlign: "center",
  },
  success: {
    backgroundColor: "#c6f6d5",
    color: "#22543d",
  },
  error: {
    backgroundColor: "#fed7d7",
    color: "#742a2a",
  },
  footerText: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "14px",
    color: "#5a6c7d",
  },
  link: {
    color: "#247ba0",
    fontWeight: "600",
    textDecoration: "none",
  },
};

// Animasi mengambang
const stylesheet = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }

  input:focus {
    outline: none;
    border-color: #70c1b3 !important;
    box-shadow: 0 0 0 3px rgba(112,193,179,0.1);
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(36,123,160,0.3);
  }

  a:hover {
    color: #70c1b3;
  }
`;

if (typeof document !== "undefined") {
  const styleTag = document.createElement("style");
  styleTag.innerHTML = stylesheet;
  document.head.appendChild(styleTag);
}
