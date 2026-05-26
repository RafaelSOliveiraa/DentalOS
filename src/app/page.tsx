"use client";

import { useState } from "react";

function ToothIcon() {
  return (
    <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 2C13.5 2 10 4.5 8 7C6.5 5.5 4.5 5 3 6C1 7.5 1 10 2 12C3 14 4 15 4 18C4 22 5 26 6 29C7 32 8 38 11 38C13 38 13.5 34 14.5 31C15.5 28 16 26 18 26C20 26 20.5 28 21.5 31C22.5 34 23 38 25 38C28 38 29 32 30 29C31 26 32 22 32 18C32 15 33 14 34 12C35 10 35 7.5 33 6C31.5 5 29.5 5.5 28 7C26 4.5 22.5 2 18 2Z"
        fill="#1D9E75"
      />
      <path
        d="M12 9C13.5 8 16 7.5 18 8"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  return (
    <main className="min-h-screen bg-[#0C0F1A] flex items-center justify-center p-4">
      {/* Subtle radial glow behind the card */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-[#1D9E75]/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-[#131726] rounded-2xl p-8 shadow-2xl border border-white/[0.06]">

          {/* Logo */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-3">
              <ToothIcon />
              <span className="text-[2rem] font-bold text-white tracking-tight">
                DentalOS
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Gestão inteligente para sua clínica
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                required
                className="w-full bg-[#0C0F1A] border border-white/[0.08] rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#1D9E75]/60 focus:ring-1 focus:ring-[#1D9E75]/40 transition-all duration-200"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-400">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#0C0F1A] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-[#1D9E75]/60 focus:ring-1 focus:ring-[#1D9E75]/40 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Esqueci minha senha */}
            <div className="flex justify-end -mt-1">
              <a
                href="#"
                className="text-sm text-[#1D9E75] hover:text-[#23c490] transition-colors duration-200"
              >
                Esqueci minha senha
              </a>
            </div>

            {/* Botão entrar */}
            <button
              type="submit"
              className="w-full bg-[#1D9E75] hover:bg-[#22b585] text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-[#1D9E75]/20 hover:shadow-[#1D9E75]/30 mt-1"
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-6">
          © {new Date().getFullYear()} DentalOS. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
