"use client";

import { useState } from "react";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  Settings, BrainCircuit, BarChart2, Download, FileSpreadsheet,
  FileText, FileBarChart, TrendingUp, TrendingDown, Target,
  CheckCircle, AlertTriangle, XCircle, Calendar,
} from "lucide-react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ─── Data — zerado (sem dados simulados) ─── */
const MONTHLY_CHART: { mes: string; faturamento: number; lucro: number }[] = [];

const PIE_DATA: { name: string; value: number; color: string }[] = [];

type KpiStatus = "ok" | "warning" | "danger";

interface KpiRow {
  indicator: string;
  value: string;
  meta: string;
  status: KpiStatus;
  pct: string;
  variation: string;
  varPos: boolean;
}

const KPI_ROWS: KpiRow[] = [];

interface ComparativoRow {
  mes: string;
  faturamento: number;
  lucro: number;
  margem: string;
  consultas: number;
  ticket: number;
  faltas: string;
  highlight?: boolean;
}

const COMPARATIVE: ComparativoRow[] = [];

const PERIODS = ["Este mês", "Últimos 3 meses", "Este ano"] as const;
type Period = typeof PERIODS[number];

/* ─── Helpers ─── */
function fmtBRL(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`; }

/* ─── SVG ─── */
import { Sidebar } from "@/components/Sidebar";

/* ─── Summary KPI card ─── */
function SummaryCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: string }) {
  const color = accent ?? "#1D9E75";
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5 flex items-start gap-4" style={{ background: "#131726" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-xs text-white/40 mb-0.5">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Chart tooltip ─── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.08] px-3 py-2.5 shadow-xl" style={{ background: "#1A1F35" }}>
      <p className="text-xs text-white/50 mb-1.5 font-medium">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {fmtBRL(p.value)}
        </p>
      ))}
    </div>
  );
}

/* ─── Revenue Chart ─── */
function RevenueChart({ data, period }: { data: typeof MONTHLY_CHART; period: Period }) {
  const periodLabel = period === "Este mês" ? "Mês atual" : period === "Últimos 3 meses" ? "Últimos 3 meses" : "Últimos 6 meses";
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#131726" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Faturamento Mensal</h3>
          <p className="text-xs text-white/35 mt-0.5">{periodLabel}</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#1D9E75" }} />Faturamento</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full" style={{ background: "#5DCAA5" }} />Lucro</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="mes" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="faturamento" name="Faturamento" fill="#1D9E75" radius={[4, 4, 0, 0]} maxBarSize={36} />
          <Line dataKey="lucro" name="Lucro" stroke="#5DCAA5" strokeWidth={2} dot={{ fill: "#5DCAA5", r: 3 }} activeDot={{ r: 5 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── Procedures Pie ─── */
function ProcedimentosPie() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#131726" }}>
      <div className="mb-5">
        <h3 className="text-white font-semibold text-sm">Procedimentos Realizados</h3>
        <p className="text-xs text-white/35 mt-0.5">Distribuição em maio 2026</p>
      </div>
      {PIE_DATA.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-dashed border-white/10" />
          <p className="text-sm text-white/30">Sem procedimentos registrados</p>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={82} dataKey="value" stroke="none">
                {PIE_DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="rounded-xl border border-white/[0.08] px-3 py-2 shadow-xl" style={{ background: "#1A1F35" }}>
                      <p className="text-xs font-semibold text-white">{payload[0].name}: {payload[0].value}%</p>
                    </div>
                  ) : null
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2.5">
            {PIE_DATA.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-white/70">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="text-sm font-bold text-white">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Report card ─── */
interface ReportCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}

function ReportCard({ icon: Icon, title, description, accent }: ReportCardProps) {
  const [hover, setHover] = useState(false);
  return (
    <div
      className="rounded-2xl border border-white/[0.06] p-5 cursor-pointer transition-all"
      style={{
        background: hover ? `rgba(${accent === "#1D9E75" ? "29,158,117" : accent === "#5B8DEF" ? "91,141,239" : "239,159,39"},0.06)` : "#131726",
        borderColor: hover ? `${accent}30` : "rgba(255,255,255,0.06)",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${accent}18` }}>
          <Icon size={20} style={{ color: accent }} />
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${accent}18`, color: accent }}>PDF</span>
      </div>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-white/40 mb-4 leading-relaxed">{description}</p>
      <button
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
        style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}25` }}
        onClick={e => e.stopPropagation()}>
        <Download size={13} /> Gerar relatório
      </button>
    </div>
  );
}

/* ─── KPI Status cell ─── */
function StatusCell({ status, pct }: { status: KpiStatus; pct: string }) {
  const cfg = {
    ok:      { icon: CheckCircle,   color: "#1D9E75", bg: "rgba(29,158,117,0.10)"  },
    warning: { icon: AlertTriangle, color: "#EF9F27", bg: "rgba(239,159,39,0.10)"  },
    danger:  { icon: XCircle,       color: "#E24B4A", bg: "rgba(226,75,74,0.10)"   },
  }[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {pct}
    </span>
  );
}

/* ─── Main Page ─── */
export default function RelatoriosPage() {
  const [period, setPeriod] = useState<Period>("Este mês");

  /* Slice data by selected period */
  const periodSlice: ComparativoRow[] =
    period === "Este mês"         ? COMPARATIVE.slice(-1)
    : period === "Últimos 3 meses" ? COMPARATIVE.slice(-3)
    : COMPARATIVE;

  const chartSlice =
    period === "Este mês"         ? MONTHLY_CHART.slice(-1)
    : period === "Últimos 3 meses" ? MONTHLY_CHART.slice(-3)
    : MONTHLY_CHART;

  /* Computed aggregates from slice */
  const totFat    = periodSlice.reduce((s, r) => s + r.faturamento, 0);
  const totLucro  = periodSlice.reduce((s, r) => s + r.lucro, 0);
  const totCons   = periodSlice.reduce((s, r) => s + r.consultas, 0);
  const avgMargem = periodSlice.length > 0
    ? (periodSlice.reduce((s, r) => s + parseFloat(r.margem), 0) / periodSlice.length).toFixed(1)
    : "0,0";
  const avgTicket = periodSlice.length > 0
    ? Math.round(periodSlice.reduce((s, r) => s + r.ticket, 0) / periodSlice.length)
    : 0;
  const avgFaltas = periodSlice.length > 0
    ? (periodSlice.reduce((s, r) => s + parseFloat(r.faltas), 0) / periodSlice.length).toFixed(0)
    : "0";

  const periodSubLabel =
    period === "Este mês"         ? "maio 2026"
    : period === "Últimos 3 meses" ? "mar–mai 2026"
    : "dez 2025–mai 2026";

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />
      <main className="flex-1 ml-16 min-h-screen">

        {/* Topbar */}
        <div className="sticky top-0 z-20 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between" style={{ background: "rgba(12,15,26,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-white font-bold text-lg">Relatórios</h1>
            <span className="text-white/25 text-sm">— DentalOS</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Period selector */}
            <div className="flex items-center rounded-xl border border-white/[0.08] overflow-hidden" style={{ background: "#131726" }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium transition-all ${period === p ? "text-white" : "text-white/40 hover:text-white/70"}`}
                  style={period === p ? { background: "rgba(29,158,117,0.15)", color: "#1D9E75" } : {}}>
                  {p}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
              <FileSpreadsheet size={14} /> Exportar Excel
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">
              <Download size={14} /> Exportar PDF
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* Line 1 — Summary KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <SummaryCard icon={DollarSign} label="Faturamento total"  value={fmtBRL(totFat)}   sub={periodSubLabel}              accent="#1D9E75" />
            <SummaryCard icon={TrendingUp} label="Lucro líquido"      value={fmtBRL(totLucro)} sub={`margem ${avgMargem}%`}      accent="#5B8DEF" />
            <SummaryCard icon={Calendar}   label="Total de consultas"  value={String(totCons)}   sub={`ticket médio R$ ${avgTicket}`} accent="#EF9F27" />
            <SummaryCard icon={Users}      label="Taxa de faltas"      value={`${avgFaltas}%`}   sub={`meta: abaixo de 7%`}       accent="#9B6DFF" />
          </div>

          {/* Line 2 — Charts */}
          <div className="grid grid-cols-2 gap-6">
            <RevenueChart data={chartSlice} period={period} />
            <ProcedimentosPie />
          </div>

          {/* Line 3 — Report cards */}
          <div className="grid grid-cols-3 gap-4">
            <ReportCard
              icon={DollarSign}
              title="Relatório Financeiro"
              description="DRE + Fluxo de Caixa + Contas a pagar e receber"
              accent="#1D9E75"
            />
            <ReportCard
              icon={Users}
              title="Relatório de Pacientes"
              description="Lista completa + inadimplentes + novos pacientes"
              accent="#5B8DEF"
            />
            <ReportCard
              icon={Package}
              title="Relatório de Estoque"
              description="Itens críticos + vencimentos + análise de custos"
              accent="#EF9F27"
            />
          </div>

          {/* Line 4 — KPI table */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={15} className="text-white/50" />
                <h3 className="text-white font-semibold text-sm">Indicadores de Desempenho — Maio 2026</h3>
              </div>
              <span className="text-xs text-white/30">{period}</span>
            </div>
            <table className="w-full">
              <thead className="border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <tr>
                  {["Indicador", "Valor", "Meta", "Status", "Variação"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {KPI_ROWS.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-sm text-white/30">
                      Sem dados de desempenho — cadastre pacientes e agendamentos para ver os indicadores.
                    </td>
                  </tr>
                ) : KPI_ROWS.map((row, i) => (
                  <tr key={row.indicator}
                    style={{ background: i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"; }}>
                    <td className="px-5 py-3 text-sm font-medium text-white/80">{row.indicator}</td>
                    <td className="px-5 py-3 text-sm font-bold text-white">{row.value}</td>
                    <td className="px-5 py-3 text-sm text-white/45">{row.meta}</td>
                    <td className="px-5 py-3"><StatusCell status={row.status} pct={row.pct} /></td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-semibold flex items-center gap-1 ${row.varPos ? "text-[#1D9E75]" : "text-[#E24B4A]"}`}>
                        {row.varPos ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {row.variation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Line 5 — Comparative table */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileBarChart size={15} className="text-white/50" />
                <h3 className="text-white font-semibold text-sm">
                  Comparativo Mensal —{" "}
                  {period === "Este mês" ? "Mês atual" : period === "Últimos 3 meses" ? "Últimos 3 meses" : "Últimos 6 meses"}
                </h3>
              </div>
              <span className="text-xs text-white/30">{periodSubLabel}</span>
            </div>
            <table className="w-full">
              <thead className="border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <tr>
                  {["Mês", "Faturamento", "Lucro", "Margem", "Consultas", "Ticket Médio", "Faltas"].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {periodSlice.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-white/30">
                      Sem dados históricos — registre receitas e consultas para ver o comparativo.
                    </td>
                  </tr>
                ) : periodSlice.map((row, i) => (
                  <tr key={row.mes}
                    style={{ background: row.highlight ? "rgba(29,158,117,0.05)" : i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = row.highlight ? "rgba(29,158,117,0.08)" : "rgba(255,255,255,0.03)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = row.highlight ? "rgba(29,158,117,0.05)" : i % 2 === 1 ? "rgba(255,255,255,0.015)" : "transparent"; }}>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${row.highlight ? "text-[#1D9E75]" : "text-white/70"}`}>
                        {row.mes}
                        {row.highlight && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: "rgba(29,158,117,0.15)", color: "#1D9E75" }}>Atual</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-white">{fmtBRL(row.faturamento)}</td>
                    <td className="px-5 py-3 text-sm text-[#5DCAA5] font-medium">{fmtBRL(row.lucro)}</td>
                    <td className="px-5 py-3 text-sm text-white/60">{row.margem}</td>
                    <td className="px-5 py-3 text-sm text-white/60">{row.consultas}</td>
                    <td className="px-5 py-3 text-sm text-white/60">R$ {row.ticket}</td>
                    <td className="px-5 py-3">
                      <span className={`text-sm font-medium ${parseFloat(row.faltas) <= 8 ? "text-[#1D9E75]" : "text-[#EF9F27]"}`}>{row.faltas}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Totals footer */}
              <tfoot className="border-t-2 border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
                <tr>
                  <td className="px-5 py-3 text-xs font-bold text-white/50 uppercase tracking-wider">Total / Média</td>
                  <td className="px-5 py-3 text-sm font-bold text-white">{fmtBRL(totFat)}</td>
                  <td className="px-5 py-3 text-sm font-bold text-[#5DCAA5]">{fmtBRL(totLucro)}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-white/60">{avgMargem}%</td>
                  <td className="px-5 py-3 text-sm font-bold text-white/60">{totCons}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-white/60">R$ {avgTicket}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-white/60">{avgFaltas}%</td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      </main>
    </div>
  );
}
