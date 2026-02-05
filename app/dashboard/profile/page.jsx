"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function BmiPage() {
  const [data, setData] = useState(null);
  const [newTarget, setNewTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState(null); // ✅ Tambahkan state profil
  const id_user =
    typeof window !== "undefined" ? localStorage.getItem("id_user") : null;

  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    const id_user = localStorage.getItem("id_user");
    if (!id_user) return console.error("❌ ID user tidak ditemukan");

    const res = await fetch(`/api/bmi?id_user=${id_user}`);
    const result = await res.json();
    console.log("✅ Data dari API:", result);

    const userProfile = Array.isArray(result) ? result[0] : result.data || result;
    if (!userProfile) return console.error("❌ Data profil tidak valid:", result);

    setData(userProfile);
    setProfile(userProfile);

    setEditData({
      usia: userProfile.usia || "",
      berat: userProfile.berat || "",
      tinggi: userProfile.tinggi || "",
      jenis_kelamin: userProfile.jenis_kelamin || "",
      nama: userProfile.username || "",
      email: userProfile.email || "",
      target_kalori: userProfile.target_kalori || 2000,
    });
  } catch (error) {
    console.error("❌ Gagal mengambil data profil:", error);
  }
};

useEffect(() => {
  fetchData();
}, []);


  const handleSaveTarget = async () => {
  if (!profile) return alert("Profil belum dimuat");
  if (!id_user) return alert("ID user tidak ditemukan");

  try {
    setSaving(true);
    const newTargetValue = Number(newTarget || profile.target_kalori);

    const res = await fetch("/api/bmi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_user: id_user,
        target_kalori: newTargetValue, // ✅ hanya kirim yang perlu
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      alert(data.message || "🎯 Target kalori berhasil diperbarui!");

      // ✅ Update state lokal biar UI langsung berubah
      setData((prev) => ({
        ...prev,
        target_kalori: newTargetValue,
      }));

      // ✅ Simpan juga ke localStorage biar Tracking ikut update
      localStorage.setItem(`targetKalori_${id_user}`, newTargetValue);

      // ✅ Refresh data dari DB (kalau mau pastiin)
      fetchData();
    } else {
      alert(data.error || "Gagal memperbarui data");
    }
  } catch (err) {
    console.error("Gagal update:", err);
    setSaving(false);
  }
};


  const handleEditProfile = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditData({
      usia: data.usia,
      jenis_kelamin: data.jenis_kelamin,
      berat: data.berat,
      tinggi: data.tinggi,
    });
  };

  const handleSaveProfile = async () => {
    if (!editData.usia || !editData.berat || !editData.tinggi) {
      return alert("Semua field harus diisi");
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.id_user) {
      return alert("Silakan login ulang — id_user tidak ditemukan!");
    }

    setSavingProfile(true);
    const res = await fetch("/api/bmi", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_user: user.id_user,
        usia: Number(editData.usia),
        jenis_kelamin: editData.jenis_kelamin,
        berat: Number(editData.berat),
        tinggi: Number(editData.tinggi),
        nama: editData.nama,
        username: editData.username,
        email: editData.email,
      }),
    });

    const result = await res.json();
    setSavingProfile(false);

    if (res.ok) {
      alert("Profil berhasil diperbarui");
      setEditing(false);
      fetchData(); // Refresh data
    } else {
      alert(result.error || "Gagal memperbarui profil");
    }
  };

  const handleEditChange = (field, value) => {
    setEditData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!data)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-14 w-14 border-t-3 border-b-3 border-indigo-500"></div>
          <p className="text-gray-600 text-sm">Memuat data kesehatan...</p>
        </div>
      </div>
    );

  if (data.error)
    return (
      <div className="max-w-6xl mx-auto mt-24 p-8 bg-red-50 border border-red-200 rounded-3xl text-center shadow-sm">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-red-600 text-lg font-medium">{data.error}</p>
      </div>
    );

  const getBmiStatus = (bmi) => {
    if (bmi < 18.5)
      return {
        label: "Kurus",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        gradient: "from-blue-500 to-cyan-500",
        cardGradient: "from-blue-500 to-cyan-500",
        icon: "📉",
        description: "Berat badan kurang dari normal",
        recommendation:
          "Tingkatkan asupan kalori dan nutrisi dengan makanan bergizi seimbang",
        range: "< 18.5",
      };
    if (bmi < 25)
      return {
        label: "Normal",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        gradient: "from-emerald-500 to-green-500",
        cardGradient: "from-emerald-500 to-green-500",
        icon: "✅",
        description: "Berat badan ideal dan sehat",
        recommendation:
          "Pertahankan pola makan sehat dan rutin berolahraga untuk menjaga kondisi",
        range: "18.5 - 24.9",
      };
    if (bmi < 30)
      return {
        label: "Gemuk",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        gradient: "from-amber-500 to-orange-500",
        cardGradient: "from-amber-500 to-orange-500",
        icon: "⚖️",
        description: "Kelebihan berat badan",
        recommendation:
          "Kurangi asupan kalori dan tingkatkan aktivitas fisik secara bertahap",
        range: "25 - 29.9",
      };
    return {
      label: "Obesitas",
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
      gradient: "from-rose-500 to-red-500",
      cardGradient: "from-rose-500 to-red-500",
      icon: "🔴",
      description: "Obesitas, berisiko tinggi terhadap penyakit",
      recommendation:
          "Konsultasi dengan ahli gizi dan dokter untuk program penurunan berat badan",
      range: "≥ 30",
    };
  };

  const bmiStatus = getBmiStatus(data.bmi);

  const idealMinWeight = (18.5 * (data.tinggi / 100) ** 2).toFixed(1);
  const idealMaxWeight = (24.9 * (data.tinggi / 100) ** 2).toFixed(1);

  const bmiCategories = [
  {
    label: "Kurus",
    range: "< 18.5",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    description: "Berat badan di bawah normal",
  },
  {
    label: "Normal",
    range: "18.5 - 24.9",
    color: "bg-emerald-50 border-emerald-200 text-emerald-700",
    description: "Berat badan ideal dan sehat",
  },
  {
    label: "Gemuk",
    range: "25 - 29.9",
    color: "bg-amber-50 border-amber-200 text-amber-700",
    description: "Kelebihan berat badan",
  },
  {
    label: "Obesitas",
    range: "≥ 30",
    color: "bg-rose-50 border-rose-200 text-rose-700",
    description: "Risiko tinggi terhadap penyakit",
  },
];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-8 px-4">
      <motion.div className="max-w-6xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <br></br>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Profile and BMI Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Profile Card */}
            <motion.div className="xl:col-span-1 group" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white text-lg">👤</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Profil Kesehatan</h2>
                  </div>
                  {!editing ? (
                    <button onClick={handleEditProfile} className="bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-600 transition-all duration-200 hover:scale-105 flex items-center gap-2">
                      <span>✏️</span>
                      Edit
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-600 disabled:opacity-50 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                      >
                        {savingProfile ? "💾" : "💾"} Simpan
                      </button>
                      <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-600 transition-all duration-200 hover:scale-105">
                        Batal
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  {/* Nama - tidak bisa diedit */}
                  <motion.div className="flex justify-between items-center py-3 border-b border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
                    <span className="text-gray-600 font-medium">Nama</span>
                    <span className="text-lg font-semibold text-gray-800">{data.username}</span>
                  </motion.div>

                  {/* Usia - editable */}
                  <motion.div className="flex justify-between items-center py-3 border-b border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}>
                    <span className="text-gray-600 font-medium">Usia</span>
                    {editing ? (
                      <input
                        type="number"
                        value={editData.usia}
                        onChange={(e) => handleEditChange("usia", e.target.value)}
                        className="w-20 text-right border border-gray-300 rounded-lg px-3 py-1 text-lg font-semibold focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                      />
                    ) : (
                      <span className="text-lg font-semibold text-gray-800">{data.usia} tahun</span>
                    )}
                  </motion.div>

                  {/* Jenis Kelamin - editable */}
                  <motion.div className="flex justify-between items-center py-3 border-b border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}>
                    <span className="text-gray-600 font-medium">Jenis Kelamin</span>
                    {editing ? (
                      <select
                        value={editData.jenis_kelamin}
                        onChange={(e) => handleEditChange("jenis_kelamin", e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-lg font-semibold focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                      >
                        <option value="Pria">Pria</option>
                        <option value="Wanita">Wanita</option>
                      </select>
                    ) : (
                      <span className="text-lg font-semibold text-gray-800">{data.jenis_kelamin}</span>
                    )}
                  </motion.div>

                  {/* Tinggi Badan - editable */}
                  <motion.div className="flex justify-between items-center py-3 border-b border-gray-100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.6 }}>
                    <span className="text-gray-600 font-medium">Tinggi Badan</span>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editData.tinggi}
                          onChange={(e) => handleEditChange("tinggi", e.target.value)}
                          className="w-20 text-right border border-gray-300 rounded-lg px-3 py-1 text-lg font-semibold focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                        />
                        <span className="text-gray-600">cm</span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-gray-800">{data.tinggi} cm</span>
                    )}
                  </motion.div>

                  {/* Berat Badan - editable */}
                  <motion.div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.7 }}>
                    <span className="text-gray-600 font-medium">Berat Badan</span>
                    {editing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.1"
                          value={editData.berat}
                          onChange={(e) => handleEditChange("berat", e.target.value)}
                          className="w-20 text-right border border-gray-300 rounded-lg px-3 py-1 text-lg font-semibold text-indigo-600 focus:ring-2 focus:ring-indigo-300 focus:outline-none"
                        />
                        <span className="text-gray-600">kg</span>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold text-indigo-600">{data.berat} kg</span>
                    )}
                  </motion.div>
                </div>

                {editing && (
                  <motion.div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                    <p className="text-sm text-blue-700 text-center">💡 Perubahan akan langsung mempengaruhi perhitungan BMI</p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* BMI Result Card - Tetap sama seperti sebelumnya */}
            <motion.div className="xl:col-span-2 group" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-lg">📊</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Hasil BMI dan Analisis</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* BMI Value */}
                  <motion.div className={`text-center p-8 bg-gradient-to-br ${bmiStatus.cardGradient} rounded-3xl text-white shadow-lg relative overflow-hidden`} whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                    <div className="relative z-10">
                      <p className="text-sm opacity-90 mb-2">Indeks BMI Anda</p>
                      <p className="text-6xl font-bold my-4">{data.bmi}</p>
                      <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                        <span>{bmiStatus.icon}</span>
                        <p className="text-lg font-semibold">{bmiStatus.label}</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Status Analysis */}
                  <motion.div className={`${bmiStatus.bgColor} ${bmiStatus.borderColor} border-2 rounded-3xl p-6 lg:col-span-2 shadow-inner`} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                    <h3 className="font-bold text-xl mb-4 text-gray-800 flex items-center gap-2">
                      <span>🔍</span>
                      Analisis Kesehatan
                    </h3>
                    <p className="text-gray-700 mb-4 text-lg leading-relaxed">{bmiStatus.description}</p>
                    <div className="bg-white/50 rounded-2xl p-4">
                      <p className="font-semibold text-gray-800 mb-2 text-lg">💡 Rekomendasi:</p>
                      <p className="text-gray-700 leading-relaxed">{bmiStatus.recommendation}</p>
                    </div>
                  </motion.div>
                </div>

                {/* BMI Scale */}
                <div className="mt-8">
                  <h3 className="font-bold text-gray-800 mb-6 text-xl flex items-center gap-2">
                    <span>📏</span>
                    Skala BMI dan Kategori
                  </h3>

                  <div className="space-y-6">
                    {/* Visual Scale */}
                    <div className="relative">
                      <div className="flex h-12 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-400 via-emerald-400 via-amber-400 to-rose-500 shadow-inner">
                        {["Kurus", "Normal", "Gemuk", "Obesitas"].map((label, index) => (
                          <div key={index} className="flex-1 flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">{label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Detailed Categories */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {bmiCategories.map((category, index) => (
                        <motion.div
                          key={index}
                          className={`${category.bgColor} rounded-2xl p-5 text-center border-2 transition-all duration-300 ${
                            bmiStatus.label === category.label ? `${category.borderColor} shadow-lg scale-105` : "border-transparent hover:scale-102"
                          }`}
                          whileHover={{ y: -2 }}
                        >
                          <div className="text-2xl mb-2">{category.icon}</div>
                          <p className={`font-bold ${category.color} mb-2 text-lg`}>{category.label}</p>
                          <p className="text-gray-600 font-semibold text-sm mb-1">{category.range}</p>
                          <p className="text-gray-500 text-xs">{category.description}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Cards Row - Tetap sama seperti sebelumnya */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Target Kalori Card */}
            <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-lg">🎯</span>
                    </div>
                    <h2 className="text-2xl font-bold">Target Kalori</h2>
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-sm opacity-90 mb-2">Harian</p>
                   <p className="text-5xl font-bold">{data.target_kalori}</p>
                    <p className="text-lg opacity-90">kkal</p>
                  </div>

                  <div className="bg-white/20 rounded-2xl p-5 backdrop-blur-sm">
                    <p className="text-sm mb-4 opacity-90">Perbarui target kalori:</p>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        placeholder="Target baru..."
                        value={newTarget}
                        onChange={(e) => setNewTarget(e.target.value)}
                        className="flex-1 border-0 rounded-xl px-4 py-3 text-sm text-gray-800 focus:ring-2 focus:ring-emerald-300 focus:outline-none placeholder-gray-500"
                      />
                      <button onClick={handleSaveTarget} disabled={saving} className="bg-white text-emerald-600 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 disabled:opacity-50 transition-all duration-200 hover:scale-105">
                        {saving ? "💾" : "Simpan"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Health Info Card */}
            <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-all duration-300 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <span className="text-white text-lg">💪</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">Informasi Kesehatan</h2>
                </div>

                <div className="space-y-5">
                  <motion.div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200" whileHover={{ scale: 1.02 }}>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">⚖️</span>
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Berat Badan Ideal</p>
                        <p className="font-bold text-blue-600 text-2xl">
                          {idealMinWeight} - {idealMaxWeight} kg
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-500 text-xs">Berdasarkan tinggi {data.tinggi} cm</p>
                  </motion.div>

                  <motion.div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border border-emerald-200" whileHover={{ scale: 1.02 }}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📈</span>
                      <div>
                        <p className="text-gray-600 text-sm font-medium">Status Saat Ini</p>
                        <p className={`font-bold ${bmiStatus.color} text-xl`}>{bmiStatus.label}</p>
                        <p className="text-gray-500 text-xs">Range: {bmiStatus.range}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Tips Card */}
            <motion.div className="group" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <div className="bg-gradient-to-br from-cyan-400 to-blue-400 rounded-3xl shadow-lg p-8 text-white relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
                      <span className="text-lg">💡</span>
                    </div>
                    <h2 className="text-2xl font-bold">Tips Sehat</h2>
                  </div>

                  <ul className="space-y-4">
                    {[
                      { icon: "💧", text: "Minum 8 gelas air putih setiap hari" },
                      { icon: "🥗", text: "Konsumsi buah dan sayur setiap makan" },
                      { icon: "🏃", text: "Olahraga 30 menit, 3x seminggu" },
                      { icon: "😴", text: "Istirahat 7-8 jam per hari" },
                    ].map((tip, index) => (
                      <motion.li key={index} className="flex items-start gap-3 bg-white/20 rounded-xl p-3 backdrop-blur-sm" whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
                        <span className="text-lg mt-0.5">{tip.icon}</span>
                        <span className="text-sm leading-relaxed">{tip.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer Note */}
        <motion.p
          className="text-center text-gray-500 text-sm mt-12 bg-white/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-100 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          💡 Data diambil berdasarkan profil registrasi. Perbarui profil untuk hasil yang lebih akurat.
        </motion.p>
      </motion.div>
    </div>
  );
}
