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

/* ─── Data ─── */
const MONTHLY_CHART = [
  { mes: "Dez", faturamento: 38200, lucro: 14800 },
  { mes: "Jan", faturamento: 41000, lucro: 16200 },
  { mes: "Fev", faturamento: 38600, lucro: 14900 },
  { mes: "Mar", faturamento: 44300, lucro: 17400 },
  { mes: "Abr", faturamento: 47100, lucro: 18600 },
  { mes: "Mai", faturamento: 52800, lucro: 21340 },
];

const PIE_DATA = [
  { name: "Ortodontia",  value: 31, color: "#5B8DEF" },
  { name: "Clareamento", value: 28, color: "#1D9E75" },
  { name: "Implante",    value: 22, color: "#9B6DFF" },
  { name: "Restauração", value: 19, color: "#EF9F27" },
];

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

const KPI_ROWS: KpiRow[] = [
  { indicator: "Faturamento",      value: "R$ 52.800", meta: "R$ 55.000", status: "warning", pct: "96%",       variation: "+12%",       varPos: true  },
  { indicator: "Lucro líquido",    value: "R$ 21.340", meta: "R$ 20.000", status: "ok",      pct: "Atingido",  variation: "+8%",         varPos: true  },
  { indicator: "Margem",           value: "40,4%",     meta: "38%",       status: "ok",      pct: "Atingido",  variation: "+1,4pp",      varPos: true  },
  { indicator: "Ticket médio",     value: "R$ 357",    meta: "R$ 350",    status: "ok",      pct: "Atingido",  variation: "+R$ 22",      varPos: true  },
  { indicator: "Ocupação agenda",  value: "78%",       meta: "80%",       status: "warning", pct: "97%",       variation: "+5pp",        varPos: true  },
  { indicator: "Taxa de faltas",   value: "8%",        meta: "7%",        status: "warning", pct: "Acima",     variation: "-3pp",        varPos: false },
  { indicator: "Pacientes novos",  value: "18",        meta: "15",        status: "ok",      pct: "Atingido",  variation: "+3",          varPos: true  },
  { indicator: "Inadimplência",    value: "R$ 4.800",  meta: "R$ 2.000",  status: "danger",  pct: "Acima",     variation: "+R$ 1.200",   varPos: false },
];

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

const COMPARATIVE: ComparativoRow[] = [
  { mes: "Dezembro",  faturamento: 38200, lucro: 14800, margem: "38,7%", consultas: 108, ticket: 354, faltas: "11%" },
  { mes: "Janeiro",   faturamento: 41000, lucro: 16200, margem: "39,5%", consultas: 116, ticket: 353, faltas: "9%"  },
  { mes: "Fevereiro", faturamento: 38600, lucro: 14900, margem: "38,6%", consultas: 109, ticket: 354, faltas: "12%" },
  { mes: "Março",     faturamento: 44300, lucro: 17400, margem: "39,3%", consultas: 125, ticket: 354, faltas: "8%"  },
  { mes: "Abril",     faturamento: 47100, lucro: 18600, margem: "39,5%", consultas: 132, ticket: 357, faltas: "11%" },
  { mes: "Maio",      faturamento: 52800, lucro: 21340, margem: "40,4%", consultas: 148, ticket: 357, faltas: "8%",  highlight: true },
];

const PERIODS = ["Este mês", "Últimos 3 meses", "Este ano"] as const;
type Period = typeof PERIODS[number];

/* ─── Helpers ─── */
function fmtBRL(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`; }

/* ─── SVG ─── */
function ToothSvg({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <path d="M22 8C16 8 10 13 10 20c0 4 1.5 7 3 10l4 20c.5 3 2 4 3.5 4s2.5-1 3-3L26 38c.5-2 1.5-3 3-3h6c1.5 0 2.5 1 3 3l2.5 13c.5 2 1.5 3 3 3s3-1 3.5-4l4-20c1.5-3 3-6 3-10 0-7-6-12-12-12-3 0-5.5 1.5-7 3C33.5 9.5 32 9 32 9s-1.5.5-2.5 1.5C28 9 25.5 8 22 8z" fill="#1D9E75" opacity="0.9" />
    </svg>
  );
}

/* ─── Sidebar ─── */
const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard",    href: "/dashboard" },
  { icon: CalendarDays,    label: "Agenda",        href: "/dashboard/agenda" },
  { icon: Users,           label: "Pacientes",     href: "/dashboard/pacientes" },
  { icon: DollarSign,      label: "Financeiro",    href: "/dashboard/financeiro" },
  { icon: Package,         label: "Estoque",       href: "/dashboard/estoque" },
  { icon: BarChart2,       label: "Relatórios",    href: "/dashboard/relatorios" },
  { icon: BrainCircuit,    label: "Assistente IA", href: "/dashboard/ia" },
  { icon: Settings,        label: "Configurações", href: "/dashboard/configuracoes" },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 gap-2 border-r border-white/[0.06] z-30" style={{ background: "#0C0F1A" }}>
      <div className="mb-4"><ToothSvg size={28} /></div>
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const active = href === "/dashboard/relatorios";
        return (
          <a key={label} href={href} title={label}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${active ? "bg-[#1D9E75]/15 text-[#1D9E75]" : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"}`}>
            <Icon size={18} />
          </a>
        );
      })}
    </aside>
  );
}

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
function RevenueChart() {
  return (
    <div className="rounded-2xl border border-white/[0.06] p-5" style={{ background: "#131726" }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-white font-semibold text-sm">Faturamento Mensal</h3>
          <p className="text-xs text-white/35 mt-0.5">Últimos 6 meses</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm" style={{ background: "#1D9E75" }} />Faturamento</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-1 rounded-full" style={{ background: "#5DCAA5" }} />Lucro</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={MONTHLY_CHART} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
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

  const totFat    = COMPARATIVE.reduce((s, r) => s + r.faturamento, 0);
  const totLucro  = COMPARATIVE.reduce((s, r) => s + r.lucro, 0);
  const totCons   = COMPARATIVE.reduce((s, r) => s + r.consultas, 0);
  const avgMargem = (COMPARATIVE.reduce((s, r) => s + parseFloat(r.margem), 0) / COMPARATIVE.length).toFixed(1);
  const avgTicket = Math.round(COMPARATIVE.reduce((s, r) => s + r.ticket, 0) / COMPARATIVE.length);
  const avgFaltas = (COMPARATIVE.reduce((s, r) => s + parseFloat(r.faltas), 0) / COMPARATIVE.length).toFixed(0);

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
            <SummaryCard icon={DollarSign}  label="Faturamento total"  value="R$ 52.800"  sub="maio 2026"         accent="#1D9E75" />
            <SummaryCard icon={TrendingUp}  label="Lucro líquido"      value="R$ 21.340"  sub="margem 40,4%"      accent="#5B8DEF" />
            <SummaryCard icon={Calendar}    label="Total de consultas"  value="148"         sub="+12% vs. abril"    accent="#EF9F27" />
            <SummaryCard icon={Users}       label="Novos pacientes"     value="18"          sub="+3 vs. meta"       accent="#9B6DFF" />
          </div>

          {/* Line 2 — Charts */}
          <div className="grid grid-cols-2 gap-6">
            <RevenueChart />
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
                {KPI_ROWS.map((row, i) => (
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
            <div className="px-5 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <FileBarChart size={15} className="text-white/50" />
              <h3 className="text-white font-semibold text-sm">Comparativo Mensal — Últimos 6 meses</h3>
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
                {COMPARATIVE.map((row, i) => (
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
