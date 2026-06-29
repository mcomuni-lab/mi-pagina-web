"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isLogin) {
      try {
        const res = await fetch("/api/users/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: name, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess("¡Ingresando...");
        setTimeout(() => router.push("/marketplace"), 1500);
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      try {
        const res = await fetch("/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setSuccess(`¡Cuenta creada para ${data.name}!`);
        setTimeout(() => router.push("/marketplace"), 1500);
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">

        <h2 className="text-3xl font-bold text-center mb-2">
          {isLogin ? "Bienvenido de nuevo" : "Crear Cuenta"}
        </h2>
        <p className="text-zinc-400 text-center mb-8 text-sm">
          {isLogin ? "Ingresa tus datos para entrar" : "Regístrate para explorar el mercado"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* LOGIN: nombre de usuario y contraseña */}
          {isLogin ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </>
          ) : (
            <>
              {/* REGISTRO: correo, contraseña, nombre, confirmar */}
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="ejemplo@correo.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Nombre de Usuario</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="Tu nombre de usuario"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 uppercase mb-2 ml-1">Confirmar Contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-zinc-600 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          )}

          {error && <p className="text-red-400 text-xs text-center bg-red-400/10 p-2 rounded-lg">{error}</p>}
          {success && <p className="text-green-400 text-xs text-center bg-green-400/10 p-2 rounded-lg">{success}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-zinc-700 text-white font-bold rounded-xl hover:bg-zinc-600 transition-transform active:scale-95 shadow-lg"
          >
            {isLogin ? "Ingresar" : "Registrarse"}
          </button>

        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-zinc-500 text-sm">
            {isLogin ? "¿No tienes cuenta todavía?" : "¿Ya tienes una cuenta?"}
          </p>
          <button
            onClick={() => { setIsLogin(!isLogin); setError(""); setSuccess(""); }}
            className="mt-2 text-white font-bold hover:underline underline-offset-4"
          >
            {isLogin ? "Crea una cuenta aquí" : "Ingresa con tu cuenta aquí"}
          </button>
        </div>

      </div>
    </div>
  );
}