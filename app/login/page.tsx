"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.username === "Sudarshona" && form.password === "Suku#2005") {
      localStorage.setItem("suku_auth", "true");
      router.push("/");
    } else {
      setError("Invalid password, my love! ❤️");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md p-8 bg-black/80 border border-rose-900 rounded-3xl shadow-2xl">
        <div className="text-center mb-10">
          <Heart className="w-12 h-12 text-rose-500 mx-auto mb-4 animate-pulse" />
          <h1 className="text-rose-500 text-4xl font-black italic tracking-tighter">
            SUKU FLIX
          </h1>
          <p className="text-gray-400 mt-2">Welcome Home, Sudarshona</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <input
            type="text"
            placeholder="Username"
            required
            className="w-full p-4 bg-zinc-900 rounded-xl border-none focus:ring-2 focus:ring-rose-500 text-white"
            onChange={(e) => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            className="w-full p-4 bg-zinc-900 rounded-xl border-none focus:ring-2 focus:ring-rose-500 text-white"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="w-full bg-rose-600 hover:bg-rose-700 py-4 rounded-xl font-bold transition-all shadow-lg text-white">
            Enter My World
          </button>
        </form>
        {error && (
          <p className="text-rose-400 text-center mt-4 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
