"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto mt-20 bg-white rounded-2xl shadow-md p-8 border border-gray-100">
      <h1 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
        Pengaturan Akun
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Notifikasi
          </label>
          <p className="text-gray-500 text-sm">
            (Fitur notifikasi akan datang — untuk sekarang hanya tampilan.)
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-600 mb-1">
            Tema
          </label>
          <select
            className="border rounded-lg p-2 w-full text-sm"
            defaultValue="light"
          >
            <option value="light">🌞 Terang</option>
            <option value="dark">🌙 Gelap</option>
          </select>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} SimpleFit — Semua Hak Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
