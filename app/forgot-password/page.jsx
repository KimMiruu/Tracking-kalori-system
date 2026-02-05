"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password || !confirm) {
      setMessage("⚠️ Semua field wajib diisi.");
      return;
    }

    if (password !== confirm) {
      setMessage("⚠️ Password tidak cocok.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password berhasil diubah. Mengarahkan ke login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setMessage(`❌ ${data.message}`);
        console.log("Server Error:", data.error);
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setMessage("⚠️ Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Background */}
      <div style={styles.background}>
        <div style={styles.bubble1}></div>
        <div style={styles.bubble2}></div>
        <div style={styles.bubble3}></div>
      </div>

      {/* Card */}
      <div style={styles.card}>
        <div style={styles.logo}>
          <div style={styles.logoIcon}>💪</div>
          <h1 style={styles.title}>SimpleFit</h1>
        </div>
        <p style={styles.subtitle}>Atur ulang kata sandi Anda</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Kata Sandi Baru</label>
            <input
              type="password"
              placeholder="Masukkan kata sandi baru"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          {/* Konfirmasi */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Konfirmasi Password</label>
            <input
              type="password"
              placeholder="Ulangi kata sandi"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              style={styles.input}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Memproses..." : "Simpan Kata Sandi"}
          </button>
        </form>

        {message && <div style={styles.message}>{message}</div>}

        <div style={styles.footer}>
          <a href="/login" style={styles.link}>
            Kembali ke Login
          </a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background:
      "linear-gradient(135deg, #a8e6cf 0%, #70c1b3 50%, #247ba0 100%)",
    fontFamily: "'Inter', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    inset: 0,
    overflow: "hidden",
  },
  bubble1: {
    position: "absolute",
    top: "10%",
    left: "10%",
    width: 120,
    height: 120,
    borderRadius: "50%",
    background: "rgba(168,230,207,0.3)",
  },
  bubble2: {
    position: "absolute",
    top: "60%",
    right: "10%",
    width: 180,
    height: 180,
    borderRadius: "50%",
    background: "rgba(112,193,179,0.25)",
  },
  bubble3: {
    position: "absolute",
    bottom: "20%",
    left: "20%",
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "rgba(36,123,160,0.2)",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: 20,
    textAlign: "center",
    zIndex: 10,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 10px 30px rgba(36,123,160,0.3)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoIcon: { fontSize: 32 },
  title: { fontSize: 32, fontWeight: 700, color: "#247ba0" },
  subtitle: { color: "#5a6c7d", fontSize: 16, marginBottom: 24 },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  inputGroup: { textAlign: "left" },
  label: { display: "block", marginBottom: 8, color: "#000", fontWeight: 500 },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #cbd5e0",
    fontSize: 16,
    color: "#000",
    backgroundColor: "#fff",
  },
  button: {
    background: "linear-gradient(135deg,#70c1b3 0%,#247ba0 100%)",
    color: "#fff",
    padding: "14px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 600,
  },
  message: { marginTop: 16, fontSize: 14, color: "#000" },
  footer: { marginTop: 20 },
  link: { color: "#247ba0", textDecoration: "none" },
};
