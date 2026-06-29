"use client";

import { useState } from "react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", isError: false });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: "", isError: false });

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Aquí atrapamos los errores de los detectores Regex del backend
        setMessage({ text: data.error || "Ocurrió un error", isError: true });
      } else {
        setMessage({ text: `¡Cuenta creada con éxito para ${data.name}!`, isError: false });
        setName("");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage({ text: "Error de conexión con el servidor.", isError: true });
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-[#0B0F19] border border-slate-800 rounded-xl shadow-md text-white">
      <h2 className="text-2xl font-bold mb-2 text-center">Crear Cuenta</h2>
      <p className="text-sm text-slate-400 mb-6 text-center">Registrate para explorar el mercado</p>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-[#161B26] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
            placeholder="Tu nombre completo"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Correo Electrónico</label>
          <input
            type="text" // Usamos text para que nuestro detector Regex valide si es un correo real
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-[#161B26] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
            placeholder="ejemplo@correo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-[#161B26] border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 text-sm"
            placeholder="••••••••"
          />
          <p className="text-[11px] text-slate-500 mt-1">Mínimo 6 caracteres, 1 mayúscula y 1 número.</p>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold rounded-lg transition-colors text-sm mt-2"
        >
          Registrarse
        </button>
      </form>

      {message.text && (
        <div className={`mt-4 p-3 rounded-lg text-sm text-center font-medium ${message.isError ? "bg-red-950/50 text-red-400 border border-red-900" : "bg-emerald-950/50 text-emerald-400 border border-emerald-900"}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}