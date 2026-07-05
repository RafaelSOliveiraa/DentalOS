"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAllParcelas, fetchAgendamentosByDate, fetchPacientes } from "@/lib/queries";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Package,
  Settings,
  Bell,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowRight,
  Target,
  Clock,
  UserPlus,
  ChevronRight,
  Wallet,
  CreditCard,
  CalendarCheck,
  UserX,
  Receipt,
  BarChart2,
  BrainCircuit,
} from "lucide-react";

// ── Utilities ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const fmtAxis = (v: number) =>
  v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`;

// ── Count-up hook ─────────────────────────────────────────────────────────────

function useCountUp(target: number, started: boolean, ms = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - t0) / ms, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, ms]);
  return val;
}

// ── Static data ───────────────────────────────────────────────────────────────

const revenueData: { month: string; faturamento: number; lucro: number }[] = [];

const alertItems: { id: number; level: "red" | "yellow" | "blue"; Icon: React.ElementType; text: string; sub: string }[] = [];

const procedureItems: { name: string; revenue: number; count: number }[] = [];

const dentistItems: { name: string; occupancy: number; revenue: number }[] = [];

// ── Primitives ────────────────────────────────────────────────────────────────

function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />;
}

function ProgressBar({
  pct,
  color = "#1D9E75",
  h = "h-1.5",
}: {
  pct: number;
  color?: string;
  h?: string;
}) {
  return (
    <div className={`w-full rounded-full bg-white/[0.06] ${h}`}>
      <div
        className={`${h} rounded-full transition-all duration-1000`}
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Tooth icon ────────────────────────────────────────────────────────────────

import { Sidebar } from "@/components/Sidebar";

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar() {
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-[#0C0F1A]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div>
        <h1 className="text-base font-bold text-white">Dashboard</h1>
        <p className="text-xs text-gray-500">{new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</p>
      </div>
      <button className="relative p-2 rounded-lg hover:bg-white/[0.05] transition-colors">
        <Bell size={18} className="text-gray-400" />
        <span className="absolute top-1 right-1 w-4 h-4 bg-[#E24B4A] rounded-full text-white text-[9px] font-bold flex items-center justify-center">
          2
        </span>
      </button>
    </header>
  );
}

// ── Row 1 — Financial KPIs ────────────────────────────────────────────────────

function FinancialKPIs({ started }: { started: boolean }) {
  const { data: parcelas = [] } = useQuery({ queryKey: ["parcelas-todas"], queryFn: fetchAllParcelas, staleTime: 0 });

  const mesAtual = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const pagas      = parcelas.filter(p => p.status === "pago" && (p.data_pagamento ?? "").startsWith(mesAtual));
  const pendentes  = parcelas.filter(p => p.status !== "pago");
  const faturValor = pagas.reduce((s, p) => s + (p.valor_pago ?? p.valor), 0);
  const recebValor = pendentes.reduce((s, p) => s + p.valor, 0);

  const faturamento = useCountUp(faturValor, started);
  const lucro       = useCountUp(faturValor, started);
  const aReceber    = useCountUp(recebValor, started);
  const saldo       = useCountUp(faturValor, started);

  const cards = [
    {
      label: "Faturamento do mês",
      value: faturamento,
      badge: faturValor > 0 ? `${pagas.length} parcela${pagas.length !== 1 ? "s" : ""} recebida${pagas.length !== 1 ? "s" : ""}` : "Sem recebimentos",
      badgeColor: faturValor > 0 ? "#1D9E75" : "#6B7280",
      Arrow: ArrowUpRight,
      Icon: TrendingUp,
      iconCls: "text-[#1D9E75] bg-[#1D9E75]/10",
    },
    {
      label: "Lucro líquido",
      value: lucro,
      badge: faturValor > 0 ? "Estimado (sem despesas)" : "Sem dados",
      badgeColor: "#6B7280",
      Arrow: ArrowUpRight,
      Icon: DollarSign,
      iconCls: "text-[#1D9E75] bg-[#1D9E75]/10",
    },
    {
      label: "A receber",
      value: aReceber,
      badge: recebValor > 0 ? `${pendentes.length} parcela${pendentes.length !== 1 ? "s" : ""} pendente${pendentes.length !== 1 ? "s" : ""}` : "Em dia",
      badgeColor: recebValor > 0 ? "#EF9F27" : "#1D9E75",
      Arrow: ArrowRight,
      Icon: CreditCard,
      iconCls: "text-[#EF9F27] bg-[#EF9F27]/10",
    },
    {
      label: "Saldo em caixa",
      value: saldo,
      badge: faturValor > 0 ? "Receitas deste mês" : "Sem dados",
      badgeColor: faturValor > 0 ? "#1D9E75" : "#6B7280",
      Arrow: ArrowUpRight,
      Icon: Wallet,
      iconCls: "text-[#1D9E75] bg-[#1D9E75]/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map(({ label, value, badge, badgeColor, Arrow, Icon, iconCls }) => (
        <div key={label} className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium leading-snug pr-2">{label}</p>
            <div className={`p-1.5 rounded-lg shrink-0 ${iconCls}`}>
              <Icon size={14} />
            </div>
          </div>
          {started ? (
            <p className="text-2xl font-bold text-white mb-1.5 tabular-nums">{fmt(value)}</p>
          ) : (
            <Skeleton className="h-7 w-36 mb-1.5" />
          )}
          {started ? (
            <span className="inline-flex items-center gap-0.5 text-xs font-medium" style={{ color: badgeColor }}>
              <Arrow size={12} />
              {badge}
            </span>
          ) : (
            <Skeleton className="h-3.5 w-28" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Row 2 — Operational KPIs ──────────────────────────────────────────────────

function OperationalKPIs({ started }: { started: boolean }) {
  const today    = new Date().toISOString().split("T")[0];
  const mesAtual = today.slice(0, 7);

  const { data: todayAppts  = [] } = useQuery({ queryKey: ["agendamentos", today],    queryFn: () => fetchAgendamentosByDate(today), staleTime: 0 });
  const { data: pacientes   = [] } = useQuery({ queryKey: ["pacientes", "dashboard"], queryFn: () => fetchPacientes(),                staleTime: 0 });
  const { data: parcelasTod = [] } = useQuery({ queryKey: ["parcelas-todas"],         queryFn: fetchAllParcelas,                      staleTime: 0 });

  const ativos   = todayAppts.filter(a => a.status !== "cancelado");
  const faltasCt = todayAppts.filter(a => a.status === "falta").length;
  const novosCt  = pacientes.filter(p => p.created_at.startsWith(mesAtual)).length;
  const faltasPct = ativos.length > 0 ? Math.round(faltasCt / ativos.length * 100) : 0;
  const ocupacaoPct = Math.min(100, ativos.length > 0 ? Math.round(ativos.length / 10 * 100) : 0);

  const pagas = parcelasTod.filter(p => p.status === "pago" && (p.data_pagamento ?? "").startsWith(mesAtual));
  const ticketVal = pagas.length > 0 ? Math.round(pagas.reduce((s, p) => s + (p.valor_pago ?? p.valor), 0) / pagas.length) : 0;

  const ocupacao = useCountUp(ocupacaoPct, started);
  const ticket   = useCountUp(ticketVal,   started);
  const faltas   = useCountUp(faltasPct,   started);
  const novos    = useCountUp(novosCt,     started);

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Ocupação da agenda */}
      <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">Ocupação da agenda</p>
          <div className="p-1.5 rounded-lg text-[#1D9E75] bg-[#1D9E75]/10">
            <CalendarCheck size={14} />
          </div>
        </div>
        {started ? (
          <>
            <p className="text-2xl font-bold text-white mb-2.5 tabular-nums">{ocupacao}%</p>
            <ProgressBar pct={ocupacao} />
          </>
        ) : (
          <>
            <Skeleton className="h-7 w-20 mb-2.5" />
            <Skeleton className="h-1.5 w-full" />
          </>
        )}
      </div>

      {/* Ticket médio */}
      <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">Ticket médio</p>
          <div className="p-1.5 rounded-lg text-[#1D9E75] bg-[#1D9E75]/10">
            <Receipt size={14} />
          </div>
        </div>
        {started ? (
          <>
            <p className="text-2xl font-bold text-white mb-1.5 tabular-nums">{fmt(ticket)}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500">
              {ticketVal > 0 ? "Média por parcela recebida" : "Sem recebimentos este mês"}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-7 w-28 mb-1.5" />
            <Skeleton className="h-3.5 w-32" />
          </>
        )}
      </div>

      {/* Taxa de faltas */}
      <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">Taxa de faltas</p>
          <div className="p-1.5 rounded-lg text-[#E24B4A] bg-[#E24B4A]/10">
            <UserX size={14} />
          </div>
        </div>
        {started ? (
          <>
            <p className="text-2xl font-bold text-white mb-1.5 tabular-nums">{faltas}%</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[#E24B4A]">
              <AlertCircle size={12} />
              Meta: abaixo de 7%
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-7 w-16 mb-1.5" />
            <Skeleton className="h-3.5 w-28" />
          </>
        )}
      </div>

      {/* Pacientes novos */}
      <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs text-gray-500 font-medium">Pacientes novos</p>
          <div className="p-1.5 rounded-lg text-[#3B82F6] bg-[#3B82F6]/10">
            <UserPlus size={14} />
          </div>
        </div>
        {started ? (
          <>
            <p className="text-2xl font-bold text-white mb-1.5 tabular-nums">{novos}</p>
            <span className="inline-flex items-center gap-0.5 text-xs font-medium text-gray-500">
              {novosCt > 0 ? "este mês" : "Nenhum cadastrado este mês"}
            </span>
          </>
        ) : (
          <>
            <Skeleton className="h-7 w-12 mb-1.5" />
            <Skeleton className="h-3.5 w-28" />
          </>
        )}
      </div>
    </div>
  );
}

// ── Row 3 — Monthly Goal ──────────────────────────────────────────────────────

function MonthlyGoal() {
  const current = 0;
  const goal    = 55000;
  const pct     = goal > 0 ? Math.round((current / goal) * 100) : 0;
  const color   = "#6B7280";

  return (
    <div className="bg-[#131726] rounded-xl p-6 border border-white/[0.06]">
      <div className="flex items-start justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold">Meta mensal: R$ 55.000</h3>
          <p className="text-gray-500 text-sm mt-1">Sem receita registrada ainda</p>
        </div>
        <div className="text-right bg-white/[0.04] border border-white/[0.06] rounded-xl px-5 py-3">
          <p className="text-xs text-gray-500 mb-0.5">Previsão de fechamento</p>
          <p className="text-lg font-bold text-gray-500">—</p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">
          R$ 0 <span className="text-gray-600">de R$ 55.000</span>
        </span>
        <span className="text-sm font-bold tabular-nums text-gray-500">{pct}%</span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-3 overflow-hidden">
        <div
          className="h-3 rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Row 4 — Revenue Chart ─────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1A1E2E] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="font-semibold mb-0.5" style={{ color: e.color }}>
          {e.dataKey === "faturamento" ? "Faturamento" : "Lucro"}: {fmt(e.value)}
        </p>
      ))}
    </div>
  );
}

function RevenueChart() {
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Faturamento & Lucro</h3>
          <p className="text-xs text-gray-500 mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#1D9E75]" />
            Faturamento
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-[#5DCAA5] rounded-full" />
            Lucro
          </span>
        </div>
      </div>
      <div className="flex-1">
        {revenueData.length === 0 ? (
          <div className="h-[230px] flex flex-col items-center justify-center gap-3">
            <TrendingUp size={32} className="text-white/10" />
            <p className="text-sm text-white/30">Sem dados de faturamento ainda</p>
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={revenueData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtAxis}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, "auto"]}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="faturamento" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={40} />
            <Line
              type="monotone"
              dataKey="lucro"
              stroke="#5DCAA5"
              strokeWidth={2}
              dot={{ fill: "#5DCAA5", r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ── Row 4 — Alerts Panel ──────────────────────────────────────────────────────

const alertStyle = {
  red:    { bg: "rgba(226,75,74,0.08)",  text: "#E24B4A" },
  yellow: { bg: "rgba(239,159,39,0.08)", text: "#EF9F27" },
  blue:   { bg: "rgba(59,130,246,0.08)", text: "#3B82F6" },
} as const;

function AlertsPanel() {
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold text-sm">Requer atenção agora</h3>
        {alertItems.length > 0 && (
          <span className="bg-[#E24B4A]/10 text-[#E24B4A] text-xs font-bold px-2 py-0.5 rounded-full">
            {alertItems.filter(a => a.level === "red").length} crítico{alertItems.filter(a => a.level === "red").length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {alertItems.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(29,158,117,0.10)" }}>
            <Target size={18} className="text-[#1D9E75]" />
          </div>
          <p className="text-sm text-white/50 font-medium">Nenhum alerta no momento</p>
          <p className="text-xs text-white/25 max-w-[180px]">Os alertas aparecerão aqui conforme você usar o sistema.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2">
          {alertItems.map(({ id, level, Icon, text, sub }) => {
            const s = alertStyle[level];
            return (
              <div key={id} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: s.bg }}>
                <Icon size={15} className="mt-0.5 shrink-0" style={{ color: s.text }} />
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium leading-snug">{text}</p>
                  <p className="text-xs mt-0.5" style={{ color: s.text }}>{sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alertItems.length > 0 && (
        <button className="mt-4 w-full flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 py-2.5 rounded-lg border border-white/[0.06] hover:border-white/10 transition-all">
          Ver todos <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ── Row 5 — Top Procedures ────────────────────────────────────────────────────

function TopProcedures() {
  const max = procedureItems[0]?.revenue ?? 1;
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
      <h3 className="text-white font-semibold text-sm mb-4">Top procedimentos</h3>
      {procedureItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <TrendingUp size={24} className="text-white/15" />
          <p className="text-sm text-white/35">Sem dados de procedimentos</p>
        </div>
      ) : (
        <div className="space-y-4">
          {procedureItems.map((p) => (
            <div key={p.name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-300">{p.name}</span>
                <div>
                  <span className="text-sm text-white font-semibold">{fmt(p.revenue)}</span>
                  <span className="text-xs text-gray-500 ml-1.5">{p.count} proc.</span>
                </div>
              </div>
              <ProgressBar pct={Math.round((p.revenue / max) * 100)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Row 5 — Dentist Occupancy ─────────────────────────────────────────────────

function DentistOccupancy() {
  const barColor = (pct: number) =>
    pct >= 80 ? "#1D9E75" : pct >= 65 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
      <h3 className="text-white font-semibold text-sm mb-4">Ocupação por dentista</h3>
      {dentistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
          <Users size={24} className="text-white/15" />
          <p className="text-sm text-white/35">Sem dados de ocupação</p>
        </div>
      ) : (
        <div className="space-y-5">
          {dentistItems.map((d) => {
            const color = barColor(d.occupancy);
            return (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-gray-300">{d.name}</span>
                  <div>
                    <span className="text-sm font-bold tabular-nums" style={{ color }}>{d.occupancy}%</span>
                    <span className="text-xs text-gray-500 ml-1.5">{fmt(d.revenue)}</span>
                  </div>
                </div>
                <ProgressBar pct={d.occupancy} color={color} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Row 5 — Financial Summary ─────────────────────────────────────────────────

function FinancialSummary() {
  const rows = [
    { label: "Contas a pagar",       value: "R$ 0",  color: "text-white"      },
    { label: "Maior despesa",        value: "—",     color: "text-white"      },
    { label: "Impostos provisionados", value: "R$ 0", color: "text-white"     },
    { label: "Margem operacional",   value: "—",     color: "text-gray-500"   },
    { label: "Taxa de inadimplência", value: "—",    color: "text-gray-500"   },
  ];

  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
      <h3 className="text-white font-semibold text-sm mb-4">Resumo financeiro</h3>
      <div className="space-y-1">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0"
          >
            <span className="text-xs text-gray-500">{r.label}</span>
            <span className={`text-sm font-semibold ${r.color}`}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0C0F1A]">
      <Sidebar />

      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 p-6 space-y-5">
          {/* Linha 1 — KPIs financeiros */}
          <FinancialKPIs started={started} />

          {/* Linha 2 — KPIs operacionais */}
          <OperationalKPIs started={started} />

          {/* Linha 3 — Meta do mês */}
          <MonthlyGoal />

          {/* Linha 4 — Gráfico + Alertas */}
          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-3"><RevenueChart /></div>
            <div className="col-span-2"><AlertsPanel /></div>
          </div>

          {/* Linha 5 — Três painéis */}
          <div className="grid grid-cols-3 gap-5 pb-6">
            <TopProcedures />
            <DentistOccupancy />
            <FinancialSummary />
          </div>
        </main>
      </div>
    </div>
  );
}
