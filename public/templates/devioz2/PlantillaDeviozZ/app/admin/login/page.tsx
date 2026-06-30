'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleLogin = () => {
    if (form.username === 'admin' && form.password === 'admin123') {
      router.push('/admin');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/image/logo-devioz.webp"
            alt="Devioz Logo"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-white">Panel Administrador</h1>
          <p className="text-gray-400 mt-1">Acceso exclusivo</p>
        </div>

        {/* Form */}
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 space-y-4">
          {/* Usuario */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Usuario</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Usuario admin"
                className="pl-10 bg-zinc-800 border-zinc-600 text-white"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                className="pl-10 pr-10 bg-zinc-800 border-zinc-600 text-white"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {/* Botón */}
          <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleLogin}>
            Ingresar al Panel
          </Button>
        </div>

        {/* Volver */}
        <p className="text-center text-sm text-gray-400 mt-4">
          <a href="/" className="hover:text-primary transition-colors">
            ← Volver al inicio
          </a>
        </p>
      </motion.div>
    </div>
  );
}