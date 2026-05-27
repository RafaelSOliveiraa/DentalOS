"use client";

import { useState } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  DollarSign,
  Package,
  Settings,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  CheckCircle2,
  Wallet,
  BarChart2,
  BrainCircuit,
} from "lucide-react";

// ── Utilities ─────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  `R$ ${n.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`;

const fmtAxis = (v: number) =>
  v === 0 ? "0" : `${(v / 1000).toFixed(0)}k`;

// ── Data ──────────────────────────────────────────────────────────────────────

const cashFlowData = [
  { month: "Dez", entradas: 38200, saidas: 28000, saldo: 10200 },
  { month: "Jan", entradas: 41000, saidas: 29500, saldo: 11500 },
  { month: "Fev", entradas: 38600, saidas: 27800, saldo: 10800 },
  { month: "Mar", entradas: 44300, saidas: 31200, saldo: 13100 },
  { month: "Abr", entradas: 47100, saidas: 32100, saldo: 15000 },
  { month: "Mai", entradas: 52800, saidas: 31400, saldo: 21400 },
];

const expensesData = [
  { name: "Salários",  value: 14200, pct: "45%" },
  { name: "Materiais", value: 8900,  pct: "28%" },
  { name: "Impostos",  value: 4224,  pct: "13%" },
  { name: "Aluguel",   value: 3600,  pct: "11%" },
  { name: "Outros",    value: 536,   pct: "2%"  },
];
const PIE_COLORS = ["#3B82F6", "#1D9E75", "#EF9F27", "#8B5CF6", "#6B7280"];

type DreType = "item" | "subtotal" | "total";
const dreRows: { prefix: string; label: string; value: number; type: DreType; red?: boolean; indent?: boolean; note?: string }[] = [
  { prefix: "+", label: "Receita bruta",        value: 52800, type: "item"     },
  { prefix: "−", label: "Impostos Simples ~8%", value: 4224,  type: "item", red: true },
  { prefix: "=", label: "Receita líquida",      value: 48576, type: "subtotal" },
  { prefix: "−", label: "Materiais e insumos",  value: 8900,  type: "item", red: true, indent: true },
  { prefix: "−", label: "Salários e pro-labore",value: 14200, type: "item", red: true, indent: true },
  { prefix: "−", label: "Aluguel e condomínio", value: 3600,  type: "item", red: true, indent: true },
  { prefix: "−", label: "Outras despesas",      value: 760,   type: "item", red: true, indent: true },
  { prefix: "=", label: "LUCRO LÍQUIDO",        value: 21340, type: "total", note: "Margem 40,4%" },
];

type RecStatus = "VENCIDA" | "HOJE" | "PENDENTE" | "PAGO";
interface Receivable { id: number; patient: string; desc: string; due: string; status: RecStatus; value: number }
const receivablesBase: Receivable[] = [
  { id: 1, patient: "João Silva",    desc: "Implante P2",   due: "01/05/2026", status: "VENCIDA",  value: 1800 },
  { id: 2, patient: "Maria Lopes",   desc: "Ortodontia P3", due: "26/05/2026", status: "HOJE",     value: 980  },
  { id: 3, patient: "Carlos Mota",   desc: "Clareamento",   due: "28/05/2026", status: "PENDENTE", value: 600  },
  { id: 4, patient: "Ana Ferreira",  desc: "Consulta",      due: "30/05/2026", status: "PENDENTE", value: 250  },
  { id: 5, patient: "Pedro Santos",  desc: "Implante P1",   due: "15/04/2026", status: "VENCIDA",  value: 2400 },
  { id: 6, patient: "Lucia Rocha",   desc: "Ortodontia P5", due: "10/05/2026", status: "VENCIDA",  value: 600  },
];

const payables = [
  { id: 1, desc: "Aluguel clínica",      due: "05/06/2026", value: 3600  },
  { id: 2, desc: "Salários + encargos",  due: "05/06/2026", value: 14200 },
  { id: 3, desc: "DentDist materiais",   due: "10/06/2026", value: 2300  },
  { id: 4, desc: "DAS Simples Nacional", due: "20/06/2026", value: 4224  },
];

const forecastMonths = [
  { month: "Junho",  receita: 54000, despesas: 32000, lucro: 22000 },
  { month: "Julho",  receita: 56000, despesas: 32500, lucro: 23500 },
  { month: "Agosto", receita: 58000, despesas: 33000, lucro: 25000 },
];

// ── Status badge ──────────────────────────────────────────────────────────────

const statusConfig: Record<RecStatus, { label: string; cls: string }> = {
  VENCIDA:  { label: "VENCIDA",  cls: "bg-[#E24B4A]/10 text-[#E24B4A]"  },
  HOJE:     { label: "HOJE",     cls: "bg-[#EF9F27]/10 text-[#EF9F27]"  },
  PENDENTE: { label: "PENDENTE", cls: "bg-white/[0.06] text-gray-400"   },
  PAGO:     { label: "PAGO",     cls: "bg-[#1D9E75]/10 text-[#1D9E75]"  },
};

function StatusBadge({ status }: { status: RecStatus }) {
  const { label, cls } = statusConfig[status];
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide ${cls}`}>
      {label}
    </span>
  );
}

// ── Tooth icon ────────────────────────────────────────────────────────────────

import { Sidebar } from "@/components/Sidebar";

// ── Topbar ────────────────────────────────────────────────────────────────────

function Topbar() {
  const [month, setMonth] = useState("2026-05");
  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between px-6 bg-[#0C0F1A]/80 backdrop-blur-md border-b border-white/[0.06]">
      <div>
        <h1 className="text-base font-bold text-white">Financeiro</h1>
        <p className="text-xs text-gray-500">Maio 2026</p>
      </div>
      <div className="flex items-center gap-3">
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-[#131726] border border-white/[0.08] text-gray-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#1D9E75]/60 [color-scheme:dark]"
        />
        <button className="flex items-center gap-2 bg-[#1D9E75] hover:bg-[#22b585] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-lg shadow-[#1D9E75]/20">
          <Download size={15} />
          Exportar PDF
        </button>
      </div>
    </header>
  );
}

// ── Row 1 — Summary cards ─────────────────────────────────────────────────────

function SummaryCards() {
  const cards = [
    {
      label: "Receita bruta",
      value: fmt(52800),
      badge: "+12% vs abril",
      badgeColor: "#1D9E75",
      Icon: TrendingUp,
      Arrow: ArrowUpRight,
      iconCls: "text-[#1D9E75] bg-[#1D9E75]/10",
    },
    {
      label: "Despesas totais",
      value: fmt(31460),
      badge: "+3% vs abril",
      badgeColor: "#E24B4A",
      Icon: TrendingDown,
      Arrow: ArrowUpRight,
      iconCls: "text-[#E24B4A] bg-[#E24B4A]/10",
    },
    {
      label: "Saldo atual",
      value: fmt(27140),
      badge: "Fluxo positivo",
      badgeColor: "#1D9E75",
      Icon: Wallet,
      Arrow: ArrowUpRight,
      iconCls: "text-[#1D9E75] bg-[#1D9E75]/10",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {cards.map(({ label, value, badge, badgeColor, Icon, Arrow, iconCls }) => (
        <div key={label} className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <div className={`p-1.5 rounded-lg ${iconCls}`}>
              <Icon size={14} />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mb-1.5 tabular-nums">{value}</p>
          <span className="inline-flex items-center gap-0.5 text-xs font-medium" style={{ color: badgeColor }}>
            <Arrow size={12} />
            {badge}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Row 2 — DRE ───────────────────────────────────────────────────────────────

function DRE() {
  return (
    <div className="bg-[#131726] rounded-xl border border-white/[0.06] overflow-hidden">
      <div className="px-6 py-4 border-b border-white/[0.06]">
        <h3 className="text-white font-semibold text-sm">DRE — Demonstrativo de Resultado</h3>
        <p className="text-xs text-gray-500 mt-0.5">Competência: Maio 2026</p>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {dreRows.map((row, i) => {
          const isTotal    = row.type === "total";
          const isSubtotal = row.type === "subtotal";

          return (
            <div
              key={i}
              className={`flex items-center justify-between px-6 py-3.5 transition-colors ${
                isTotal
                  ? "bg-[#1D9E75]/[0.08] hover:bg-[#1D9E75]/[0.12]"
                  : isSubtotal
                  ? "bg-white/[0.03] hover:bg-white/[0.05]"
                  : "hover:bg-white/[0.02]"
              }`}
            >
              <div className={`flex items-center gap-3 ${row.indent ? "pl-6" : ""}`}>
                <span
                  className={`w-5 text-center text-xs font-bold font-mono shrink-0 ${
                    row.prefix === "=" ? "text-gray-500" :
                    row.prefix === "+" ? "text-[#1D9E75]" : "text-[#E24B4A]"
                  }`}
                >
                  {row.prefix}
                </span>
                <span
                  className={`text-sm ${
                    isTotal ? "text-[#1D9E75] font-bold uppercase tracking-wide" :
                    isSubtotal ? "text-white font-semibold" :
                    row.red ? "text-gray-300" : "text-white"
                  }`}
                >
                  {row.label}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {row.note && (
                  <span className="text-xs text-gray-500 font-medium">{row.note}</span>
                )}
                <span
                  className={`text-sm font-semibold tabular-nums min-w-[7rem] text-right ${
                    isTotal    ? "text-[#1D9E75] text-base font-bold" :
                    isSubtotal ? "text-white" :
                    row.red    ? "text-[#E24B4A]" : "text-white"
                  }`}
                >
                  {fmt(row.value)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Row 3 — Receivables ───────────────────────────────────────────────────────

function Receivables() {
  const [items, setItems] = useState<Receivable[]>(receivablesBase);

  function markPaid(id: number) {
    setItems((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "PAGO" } : r))
    );
  }

  const totalVencido = items
    .filter((r) => r.status === "VENCIDA")
    .reduce((s, r) => s + r.value, 0);

  return (
    <div className="bg-[#131726] rounded-xl border border-white/[0.06] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <h3 className="text-white font-semibold text-sm">Contas a Receber</h3>
        <span className="bg-[#1D9E75]/10 text-[#1D9E75] text-xs font-bold px-2.5 py-1 rounded-full">
          R$ 14.200
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Paciente", "Descrição", "Vencimento", "Status", "Valor", ""].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3 text-white font-medium whitespace-nowrap">{r.patient}</td>
                <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{r.desc}</td>
                <td className="px-5 py-3 text-gray-400 whitespace-nowrap font-mono text-xs">{r.due}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="px-5 py-3 text-white font-semibold tabular-nums whitespace-nowrap">
                  {fmt(r.value)}
                </td>
                <td className="px-5 py-3">
                  {r.status !== "PAGO" ? (
                    <button
                      onClick={() => markPaid(r.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#1D9E75] transition-colors opacity-0 group-hover:opacity-100 whitespace-nowrap"
                    >
                      <CheckCircle2 size={13} />
                      Marcar como pago
                    </button>
                  ) : (
                    <span className="flex items-center gap-1 text-xs text-[#1D9E75]">
                      <CheckCircle2 size={13} />
                      Pago
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] mt-auto">
        <span className="text-xs text-gray-500">
          {items.filter((r) => r.status === "VENCIDA").length} vencidas
        </span>
        <span className="text-xs font-semibold text-[#E24B4A]">
          Total vencido: {fmt(totalVencido)}
        </span>
      </div>
    </div>
  );
}

// ── Row 3 — Payables ──────────────────────────────────────────────────────────

function Payables() {
  const total = payables.reduce((s, p) => s + p.value, 0);

  return (
    <div className="bg-[#131726] rounded-xl border border-white/[0.06] flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-white font-semibold text-sm">Contas a Pagar</h3>
          <p className="text-xs text-gray-500 mt-0.5">Junho 2026</p>
        </div>
        <span className="bg-[#E24B4A]/10 text-[#E24B4A] text-xs font-bold px-2.5 py-1 rounded-full">
          R$ 24.324
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Descrição", "Vencimento", "Status", "Valor"].map((h) => (
                <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {payables.map((p) => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3 text-white font-medium">{p.desc}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs whitespace-nowrap">{p.due}</td>
                <td className="px-5 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide bg-white/[0.06] text-gray-400">
                    PENDENTE
                  </span>
                </td>
                <td className="px-5 py-3 text-white font-semibold tabular-nums whitespace-nowrap">
                  {fmt(p.value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.06] mt-auto">
        <span className="text-xs text-gray-500">4 lançamentos</span>
        <span className="text-xs font-semibold text-white">
          Total junho: {fmt(total)}
        </span>
      </div>
    </div>
  );
}

// ── Row 4 — Cash flow chart ───────────────────────────────────────────────────

function CashFlowTooltip({ active, payload, label }: { active?: boolean; payload?: { dataKey: string; color: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const labels: Record<string, string> = {
    entradas: "Entradas",
    saidas:   "Saídas",
    saldo:    "Saldo",
  };
  return (
    <div className="bg-[#1A1E2E] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-gray-400 font-medium mb-2">{label}</p>
      {payload.map((e) => (
        <p key={e.dataKey} className="font-semibold mb-0.5" style={{ color: e.color }}>
          {labels[e.dataKey] ?? e.dataKey}: {fmt(e.value)}
        </p>
      ))}
    </div>
  );
}

function CashFlowChart() {
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold text-sm">Fluxo de Caixa</h3>
          <p className="text-xs text-gray-500 mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#1D9E75]" />
            Entradas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block bg-[#E24B4A]" />
            Saídas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 h-0.5 bg-white/60 rounded-full" />
            Saldo
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={cashFlowData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#1D9E75" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1D9E75" stopOpacity={0}    />
            </linearGradient>
            <linearGradient id="gradSaidas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E24B4A" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#E24B4A" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={fmtAxis} tick={{ fill: "#6b7280", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, "auto"]} />
          <Tooltip content={<CashFlowTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Area type="monotone" dataKey="entradas" stroke="#1D9E75" strokeWidth={2} fill="url(#gradEntradas)" dot={false} />
          <Area type="monotone" dataKey="saidas"   stroke="#E24B4A" strokeWidth={2} fill="url(#gradSaidas)"   dot={false} />
          <Line  type="monotone" dataKey="saldo"   stroke="rgba(255,255,255,0.6)" strokeWidth={1.5} strokeDasharray="4 3" dot={{ fill: "rgba(255,255,255,0.6)", r: 3, strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Row 5 — Expenses pie ──────────────────────────────────────────────────────

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { pct: string } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="bg-[#1A1E2E] border border-white/10 rounded-xl p-3 shadow-2xl text-xs">
      <p className="text-white font-semibold">{p.name}</p>
      <p className="text-gray-400">{fmt(p.value)}</p>
      <p className="text-gray-400">{p.payload.pct}</p>
    </div>
  );
}

function ExpensesPie() {
  const total = expensesData.reduce((s, d) => s + d.value, 0);
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06] h-full">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-sm">Despesas por categoria</h3>
        <p className="text-xs text-gray-500 mt-0.5">Total: {fmt(total)}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="shrink-0">
          <PieChart width={180} height={180}>
            <Pie
              data={expensesData}
              cx={90}
              cy={90}
              innerRadius={52}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {expensesData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip content={<PieTooltip />} />
          </PieChart>
        </div>

        <div className="flex-1 space-y-2.5 min-w-0">
          {expensesData.map((d, i) => (
            <div key={d.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i] }} />
                <span className="text-xs text-gray-400 truncate">{d.name}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs text-white font-semibold">{fmt(d.value)}</span>
                <span className="text-xs text-gray-600 ml-1">{d.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Row 5 — Forecast ──────────────────────────────────────────────────────────

function Forecast() {
  return (
    <div className="bg-[#131726] rounded-xl p-5 border border-white/[0.06] h-full">
      <div className="mb-5">
        <h3 className="text-white font-semibold text-sm">Previsão Financeira</h3>
        <p className="text-xs text-gray-500 mt-0.5">Próximos 3 meses</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        {forecastMonths.map((m) => (
          <div key={m.month} className="bg-[#0C0F1A] rounded-xl p-4 border border-white/[0.06]">
            <p className="text-xs text-gray-500 font-medium mb-3">{m.month}</p>
            <div className="space-y-2">
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Receita</p>
                <p className="text-sm font-bold text-[#1D9E75] tabular-nums">{fmt(m.receita)}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-600 mb-0.5">Despesas</p>
                <p className="text-sm font-semibold text-[#E24B4A] tabular-nums">{fmt(m.despesas)}</p>
              </div>
              <div className="pt-2 border-t border-white/[0.06]">
                <p className="text-[10px] text-gray-600 mb-0.5">Lucro</p>
                <p className="text-sm font-bold text-white tabular-nums">{fmt(m.lucro)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-4 py-3 border border-white/[0.04]">
        <span className="text-[#3B82F6] mt-0.5 shrink-0">ℹ</span>
        <p className="text-xs text-gray-500 leading-relaxed">
          Baseado na média dos últimos 3 meses + tendência de crescimento de 4% a.m.
        </p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FinanceiroPage() {
  return (
    <div className="flex min-h-screen bg-[#0C0F1A]">
      <Sidebar />

      <div className="flex-1 ml-16 flex flex-col min-h-screen">
        <Topbar />

        <main className="flex-1 p-6 space-y-5 pb-8">
          {/* Linha 1 — Cards resumo */}
          <SummaryCards />

          {/* Linha 2 — DRE */}
          <DRE />

          {/* Linha 3 — Contas a receber + a pagar */}
          <div className="grid grid-cols-2 gap-5">
            <Receivables />
            <Payables />
          </div>

          {/* Linha 4 — Fluxo de caixa */}
          <CashFlowChart />

          {/* Linha 5 — Rosca + Previsão */}
          <div className="grid grid-cols-5 gap-5">
            <div className="col-span-2"><ExpensesPie /></div>
            <div className="col-span-3"><Forecast /></div>
          </div>
        </main>
      </div>
    </div>
  );
}
