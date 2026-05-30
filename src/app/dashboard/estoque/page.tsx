"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export default function EstoquePage() {
  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />

      <main className="flex-1 ml-16 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-6 text-center max-w-md px-8">

          {/* Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center"
            style={{
              background: "rgba(29,158,117,0.10)",
              border: "1.5px solid rgba(29,158,117,0.22)",
              boxShadow: "0 0 40px rgba(29,158,117,0.08)",
            }}
          >
            <Package size={44} className="text-[#1D9E75]" />
          </div>

          {/* Title + description */}
          <div>
            <h1 className="text-2xl font-bold text-white mb-3">
              Estoque — Em breve
            </h1>
            <p className="text-white/45 text-sm leading-relaxed">
              O módulo de controle de estoque está sendo desenvolvido e estará
              disponível em breve. Aqui você poderá gerenciar insumos, controlar
              validades e registrar movimentações de entrada e saída.
            </p>
          </div>

          {/* Badge */}
          <span
            className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
            style={{
              background: "rgba(29,158,117,0.14)",
              color: "#1D9E75",
              border: "1px solid rgba(29,158,117,0.28)",
            }}
          >
            Coming Soon
          </span>

          {/* Back button */}
          <Link
            href="/dashboard"
            className="mt-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white/60 border border-white/[0.10] hover:text-white hover:border-white/25 hover:bg-white/[0.04] transition-all"
          >
            ← Voltar ao dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
