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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Registrasi berhasil! Silakan login.");
        setTimeout(() => (window.location.href = "/login"), 1500);
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (error) {
      setMessage("⚠️ Gagal menghubungi server.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Daftar Akun SimpleFit</h1>

        <form onSubmit={handleRegister} style={styles.form}>
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

          <button type="submit" style={styles.button}>
            Daftar
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={{ marginTop: 20 }}>
          Sudah punya akun?{" "}
          <a href="/login" style={{ color: "#247ba0", textDecoration: "none", fontWeight: "bold" }}>
            Login
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
    background: "linear-gradient(to bottom right, #70c1b3, #247ba0)",
  },
  card: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "100%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#247ba0",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  input: {
    padding: "12px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    backgroundColor: "#247ba0",
    color: "#fff",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
  message: {
    marginTop: "15px",
    color: "#333",
  },
};
