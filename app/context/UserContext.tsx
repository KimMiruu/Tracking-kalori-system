// prettier-ignore
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserData {
  id_user: number;
  nama: string;
  email: string;
  target_kalori?: number;
}

interface UserContextType {
  user: UserData | null;
  setUser: (user: UserData | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("userData");
      if (stored) setUser(JSON.parse(stored));
    } catch (err) {
      console.error("⚠️ Gagal ambil userData:", err);
    }
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("userData", JSON.stringify(user));
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUser() harus dipanggil di dalam <UserProvider>");
  return context;
}
