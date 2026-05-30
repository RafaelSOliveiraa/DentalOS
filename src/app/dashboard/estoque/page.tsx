"use client";

import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  Settings, Search, Plus, X, ChevronUp, ChevronDown, MoreHorizontal,
  AlertTriangle, Clock, CheckCircle, ArrowUp, ArrowDown, History,
  Truck, ShoppingCart, RefreshCw, MapPin, Boxes, Tag, Wrench,
  PackagePlus, PackageX, ListChecks, CalendarClock,
  Shield, ClipboardList, BarChart2, BrainCircuit, LoaderCircle,
} from "lucide-react";
import { createEstoqueMov } from "@/lib/queries";

/* ─── Types ─── */
type ItemStatus = "CRÍTICO" | "VENCENDO" | "OK";
type MovType = "ENTRADA" | "SAÍDA" | "AJUSTE";
type Category = "EPI" | "Farmácia" | "Material" | "Instrumentos" | "Ortodontia" | "Descartáveis";

interface InventoryItem {
  id: number;
  name: string;
  category: Category;
  currentQty: number;
  minQty: number;
  idealQty: number;
  unit: string;
  expiry?: string;
  supplier: string;
  unitCost: number;
  location: string;
  status: ItemStatus;
}

interface Movement {
  id: number;
  type: MovType;
  item: string;
  qty: number;
  unit: string;
  date: string;
  user: string;
  reason: string;
}

/* ─── Data ─── */
const ITEMS: InventoryItem[] = [
  { id: 1,  name: "Luva P",                   category: "EPI",          currentQty: 2,   minQty: 5,  idealQty: 20,  unit: "caixas",   expiry: "12/2026", supplier: "MedSupply", unitCost: 45.00,  location: "Armário A1", status: "CRÍTICO"  },
  { id: 2,  name: "Anestésico Mepivacaína",   category: "Farmácia",     currentQty: 80,  minQty: 20, idealQty: 120, unit: "tubetes",  expiry: "06/2026", supplier: "DentDist",  unitCost: 2.80,   location: "Farmácia",   status: "VENCENDO" },
  { id: 3,  name: "Luva M",                   category: "EPI",          currentQty: 12,  minQty: 5,  idealQty: 20,  unit: "caixas",   expiry: "12/2026", supplier: "MedSupply", unitCost: 45.00,  location: "Armário A1", status: "OK"       },
  { id: 4,  name: "Broca FG Carbide",         category: "Instrumentos", currentQty: 45,  minQty: 10, idealQty: 60,  unit: "unidades",            supplier: "DentTools",  unitCost: 18.00,  location: "Gaveta B3",  status: "OK"       },
  { id: 5,  name: "Resina Filtek Z350",       category: "Material",     currentQty: 4,   minQty: 3,  idealQty: 10,  unit: "kits",     expiry: "08/2026", supplier: "3M Dental", unitCost: 320.00, location: "Armário B2", status: "VENCENDO" },
  { id: 6,  name: "Sugador Descartável",      category: "Descartáveis", currentQty: 380, minQty: 50, idealQty: 500, unit: "unidades",            supplier: "MedSupply", unitCost: 0.35,   location: "Depósito",   status: "OK"       },
  { id: 7,  name: "Fio Ortodôntico 0.16",     category: "Ortodontia",   currentQty: 1,   minQty: 5,  idealQty: 15,  unit: "rolos",               supplier: "OrthoPlus", unitCost: 85.00,  location: "Armário C1", status: "CRÍTICO"  },
  { id: 8,  name: "Espelho Clínico",          category: "Instrumentos", currentQty: 18,  minQty: 5,  idealQty: 25,  unit: "unidades",            supplier: "DentTools",  unitCost: 12.00,  location: "Gaveta B1",  status: "OK"       },
  { id: 9,  name: "Cimento de Ionômero",      category: "Material",     currentQty: 0,   minQty: 3,  idealQty: 8,   unit: "frascos",  expiry: "03/2027", supplier: "3M Dental", unitCost: 95.00,  location: "Armário B2", status: "CRÍTICO"  },
  { id: 10, name: "Algodão em Rolo",          category: "Descartáveis", currentQty: 5,   minQty: 2,  idealQty: 10,  unit: "pacotes",             supplier: "MedSupply", unitCost: 8.50,   location: "Depósito",   status: "OK"       },
];

const MOVEMENTS: Movement[] = [
  { id: 1, type: "SAÍDA",   item: "Luva P",                 qty: 2,   unit: "caixas",   date: "26/05/2026", user: "Dra. Ana Paula", reason: "Uso no consultório" },
  { id: 2, type: "ENTRADA", item: "Luva M",                 qty: 5,   unit: "caixas",   date: "25/05/2026", user: "Recebimento",    reason: "Pedido #4821" },
  { id: 3, type: "SAÍDA",   item: "Anestésico Mepivacaína", qty: 10,  unit: "tubetes",  date: "25/05/2026", user: "Dr. Bruno",      reason: "Uso clínico" },
  { id: 4, type: "SAÍDA",   item: "Resina Filtek Z350",     qty: 2,   unit: "kits",     date: "24/05/2026", user: "Dra. Carla",     reason: "Procedimento restauração" },
  { id: 5, type: "AJUSTE",  item: "Algodão em Rolo",        qty: 3,   unit: "pacotes",  date: "23/05/2026", user: "Inventário",     reason: "Contagem periódica" },
  { id: 6, type: "ENTRADA", item: "Sugador Descartável",    qty: 100, unit: "unidades", date: "23/05/2026", user: "Recebimento",    reason: "Pedido #4819" },
  { id: 7, type: "SAÍDA",   item: "Broca FG Carbide",       qty: 5,   unit: "unidades", date: "22/05/2026", user: "Dra. Ana Paula", reason: "Desgaste de uso" },
  { id: 8, type: "ENTRADA", item: "Espelho Clínico",        qty: 3,   unit: "unidades", date: "21/05/2026", user: "Recebimento",    reason: "Pedido #4815" },
];

const SUPPLIERS = ["MedSupply", "DentDist", "DentTools", "3M Dental", "OrthoPlus"];
const CATEGORIES: Category[] = ["EPI", "Farmácia", "Material", "Instrumentos", "Ortodontia", "Descartáveis"];

/* ─── Status config ─── */
const STATUS_CFG: Record<ItemStatus, { label: string; dot: string; bg: string; text: string; rowBg: string; rowHoverBg: string; icon: React.ElementType }> = {
  CRÍTICO:  { label: "Crítico",  dot: "#E24B4A", bg: "rgba(226,75,74,0.12)",   text: "#E24B4A", rowBg: "rgba(226,75,74,0.03)",   rowHoverBg: "rgba(226,75,74,0.06)",   icon: PackageX      },
  VENCENDO: { label: "Vencendo", dot: "#EF9F27", bg: "rgba(239,159,39,0.12)",  text: "#EF9F27", rowBg: "rgba(239,159,39,0.03)",  rowHoverBg: "rgba(239,159,39,0.06)",  icon: CalendarClock },
  OK:       { label: "OK",       dot: "#1D9E75", bg: "rgba(29,158,117,0.12)",   text: "#1D9E75", rowBg: "transparent",            rowHoverBg: "rgba(255,255,255,0.02)", icon: CheckCircle   },
};

const MOV_CFG: Record<MovType, { bg: string; text: string; icon: React.ElementType }> = {
  ENTRADA: { bg: "rgba(29,158,117,0.12)",  text: "#1D9E75", icon: ArrowUp   },
  SAÍDA:   { bg: "rgba(226,75,74,0.12)",   text: "#E24B4A", icon: ArrowDown },
  AJUSTE:  { bg: "rgba(239,159,39,0.12)",  text: "#EF9F27", icon: RefreshCw },
};

const CAT_CFG: Record<Category, { color: string; icon: React.ElementType }> = {
  EPI:          { color: "#5B8DEF", icon: Shield      },
  Farmácia:     { color: "#9B6DFF", icon: ClipboardList },
  Material:     { color: "#1D9E75", icon: Boxes       },
  Instrumentos: { color: "#EF9F27", icon: Wrench      },
  Ortodontia:   { color: "#E05FA0", icon: Tag         },
  Descartáveis: { color: "#8C8CA0", icon: Package     },
};

/* ─── Helpers ─── */
function fmtBRL(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; }
function fmtBRLInt(v: number) { return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }
function qtyPct(item: InventoryItem) { return item.minQty > 0 ? Math.min(100, Math.round((item.currentQty / item.minQty) * 100)) : 100; }

/* ─── SVG ─── */
import { Sidebar } from "@/components/Sidebar";

/* ─── KPI Card ─── */
function KpiCard({ icon: Icon, label, value, sub, accent }: { icon: React.ElementType; label: string; value: string; sub?: string; accent?: string }) {
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

/* ─── Status badge ─── */
function StatusBadge({ status }: { status: ItemStatus }) {
  const cfg = STATUS_CFG[status];
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap" style={{ background: cfg.bg, color: cfg.text }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

/* ─── SortTh ─── */
function SortTh({ children, col, sortCol, sortDir, onSort }: {
  children: React.ReactNode; col: string;
  sortCol: string | null; sortDir: "asc" | "desc" | null;
  onSort: (col: string) => void;
}) {
  const active = sortCol === col;
  return (
    <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 select-none whitespace-nowrap" onClick={() => onSort(col)}>
      <span className="inline-flex items-center gap-1">
        {children}
        <span className="flex flex-col" style={{ lineHeight: 0 }}>
          <ChevronUp size={10} className={active && sortDir === "asc" ? "text-[#1D9E75]" : "opacity-30"} />
          <ChevronDown size={10} className={active && sortDir === "desc" ? "text-[#1D9E75]" : "opacity-30"} />
        </span>
      </span>
    </th>
  );
}

/* ─── Row menu ─── */
function RowMenu({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-colors">
        <MoreHorizontal size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 rounded-xl border border-white/[0.08] shadow-xl z-20 overflow-hidden" style={{ background: "#1A1F35" }}>
            {[
              { icon: PackagePlus, label: "Registrar entrada", danger: false },
              { icon: ArrowDown,   label: "Registrar saída",   danger: false },
              { icon: RefreshCw,   label: "Fazer ajuste",      danger: false },
              { icon: ShoppingCart,label: "Gerar pedido",      danger: false },
              { icon: PackageX,    label: "Remover item",      danger: true  },
            ].map(({ icon: Icon, label, danger }) => (
              <button key={label} onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm transition-colors ${danger ? "text-[#E24B4A] hover:bg-[#E24B4A]/[0.08]" : "text-white/70 hover:bg-white/[0.06]"}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Add Item Modal ─── */
function AddItemModal({ onClose }: { onClose: () => void }) {
  const [movType, setMovType] = useState<MovType>("ENTRADA");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" style={{ background: "#131726" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold text-base flex items-center gap-2"><PackagePlus size={16} className="text-[#1D9E75]" /> Adicionar Item</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-white/40 mb-1.5">Nome do item *</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="Ex: Luva descartável G" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Categoria</label>
              <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Unidade de medida</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="caixas, unidades, rolos…" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Qtd atual</label>
              <input type="number" min="0" className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Qtd mínima *</label>
              <input type="number" min="0" className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="5" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Qtd ideal</label>
              <input type="number" min="0" className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="20" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Custo unitário</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="R$ 0,00" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Fornecedor</label>
              <select className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }}>
                <option value="">Selecionar…</option>
                {SUPPLIERS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Data de validade</label>
              <input type="month" className="w-full rounded-xl px-3 py-2.5 text-sm text-white/70 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Localização na clínica</label>
              <input className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors" style={{ background: "#0C0F1A" }} placeholder="Ex: Armário A1" />
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">Cancelar</button>
          <button className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">Salvar item</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Register Movement Modal (P5 — saves to estoque_movimentacoes) ─── */
function RegisterMovModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const MOV_TYPES: MovType[] = ["ENTRADA", "SAÍDA", "AJUSTE"];

  /* Controlled fields */
  const [movType,   setMovType]   = useState<MovType>("ENTRADA");
  const [itemNome,  setItemNome]  = useState("");
  const [quantidade,setQuantidade]= useState("");
  const [custo,     setCusto]     = useState("");
  const [motivo,    setMotivo]    = useState("");
  const [data,      setData]      = useState(new Date().toISOString().split("T")[0]);

  const saveMut = useMutation({
    mutationFn: () =>
      createEstoqueMov({
        tipo:          movType,
        item_nome:     itemNome,
        quantidade:    Number(quantidade) || 0,
        custo_unitario: custo ? Number(custo.replace(",", ".")) : null,
        motivo:        motivo || null,
        data,
        usuario:       null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estoque-movimentacoes"] });
      toast.success("Movimentação registrada com sucesso!");
      onClose();
    },
    onError: (e: Error) => toast.error(`Erro ao registrar: ${e.message}`),
  });

  const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder-white/20 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/50 transition-colors";
  const inputStyle = { background: "#0C0F1A" };
  const canSave = itemNome.trim() && quantidade && Number(quantidade) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.75)" }}>
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden" style={{ background: "#131726" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold text-base flex items-center gap-2"><History size={16} className="text-[#1D9E75]" /> Registrar Movimentação</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          {/* Tipo */}
          <div>
            <label className="block text-xs text-white/40 mb-2">Tipo de movimentação</label>
            <div className="flex gap-2">
              {MOV_TYPES.map(t => {
                const cfg = MOV_CFG[t];
                const active = movType === t;
                return (
                  <button key={t} onClick={() => setMovType(t)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-all ${active ? "border-transparent" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}
                    style={active ? { background: cfg.bg, color: cfg.text, borderColor: `${cfg.text}30` } : {}}>
                    <cfg.icon size={13} /> {t}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Item */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Item *</label>
            <input
              list="items-list"
              value={itemNome}
              onChange={e => setItemNome(e.target.value)}
              className={inputCls} style={inputStyle}
              placeholder="Nome do item…"
            />
            <datalist id="items-list">
              {ITEMS.map(i => <option key={i.id} value={i.name} />)}
            </datalist>
          </div>
          {/* Qty + Custo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Quantidade *</label>
              <input
                type="number" min="1"
                value={quantidade} onChange={e => setQuantidade(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Custo unitário</label>
              <input
                value={custo} onChange={e => setCusto(e.target.value)}
                className={inputCls} style={inputStyle}
                placeholder="0,00"
              />
            </div>
          </div>
          {/* Motivo */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Motivo / Observação</label>
            <input
              value={motivo} onChange={e => setMotivo(e.target.value)}
              className={inputCls} style={inputStyle}
              placeholder="Ex: Uso no consultório, Pedido #1234…"
            />
          </div>
          {/* Data */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Data</label>
            <input
              type="date"
              value={data} onChange={e => setData(e.target.value)}
              className={inputCls + " text-white/70"} style={inputStyle}
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => saveMut.mutate()}
            disabled={saveMut.isPending || !canSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] disabled:opacity-60 transition-colors"
          >
            {saveMut.isPending ? <LoaderCircle size={14} className="animate-spin" /> : null}
            Registrar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Alerts Panel ─── */
function AlertsPanel({ items, onOrder }: { items: InventoryItem[]; onOrder: () => void }) {
  const alerts = items.filter(i => i.status !== "OK");
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-[#E24B4A]" />
          <h3 className="text-white font-semibold text-sm">Requer atenção imediata</h3>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(226,75,74,0.12)", color: "#E24B4A" }}>{alerts.length}</span>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {alerts.map(item => {
          const cfg = STATUS_CFG[item.status];
          const reposQty = item.idealQty - item.currentQty;
          const reposCost = reposQty * item.unitCost;
          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{item.name}</span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">
                    {item.status === "CRÍTICO"
                      ? `${item.currentQty} ${item.unit} restante${item.currentQty !== 1 ? "s" : ""} (mín: ${item.minQty})`
                      : `Vence em ${item.expiry}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/40">
                <Truck size={11} />
                <span>{item.supplier}</span>
                <span className="text-white/20">·</span>
                <span>Reposição estimada: <span className="font-semibold" style={{ color: cfg.text }}>{fmtBRLInt(reposCost)}</span></span>
              </div>
              <div className="flex gap-2">
                <button onClick={onOrder}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">
                  <ShoppingCart size={11} /> Gerar ordem de compra
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
                  <Truck size={11} /> Contatar fornecedor
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Movements Panel ─── */
function MovementsPanel({ onNew }: { onNew: () => void }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
      <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History size={15} className="text-white/50" />
          <h3 className="text-white font-semibold text-sm">Histórico de movimentações</h3>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#5DCAA5] transition-colors">
          <Plus size={12} /> Nova
        </button>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {MOVEMENTS.map(mov => {
          const cfg = MOV_CFG[mov.type];
          const Icon = cfg.icon;
          return (
            <div key={mov.id} className="px-5 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: cfg.bg }}>
                <Icon size={14} style={{ color: cfg.text }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/80 font-medium truncate">{mov.item}</span>
                  <span className="text-xs font-semibold whitespace-nowrap" style={{ color: cfg.text }}>
                    {mov.type === "ENTRADA" ? "+" : mov.type === "SAÍDA" ? "-" : "~"}{mov.qty} {mov.unit}
                  </span>
                </div>
                <p className="text-xs text-white/35 truncate">{mov.date} · {mov.user}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
type StatusFilter = "Todos" | ItemStatus;

const STATUS_FILTER_CHIPS: Array<{ label: string; value: StatusFilter }> = [
  { label: "Todos",    value: "Todos"    },
  { label: "Críticos", value: "CRÍTICO"  },
  { label: "Vencendo", value: "VENCENDO" },
  { label: "OK",       value: "OK"       },
];

export default function EstoquePage() {
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<StatusFilter>("Todos");
  const [catFilter, setCatFilter]         = useState<Category | "Todos">("Todos");
  const [sortCol, setSortCol]             = useState<string | null>(null);
  const [sortDir, setSortDir]             = useState<"asc" | "desc" | null>(null);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [showMovModal, setShowMovModal]   = useState(false);

  function handleSort(col: string) {
    if (sortCol === col) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortCol(null); setSortDir(null); }
    } else { setSortCol(col); setSortDir("asc"); }
  }

  const filtered = useMemo(() => {
    let list = [...ITEMS];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q) || i.supplier.toLowerCase().includes(q));
    }
    if (statusFilter !== "Todos") list = list.filter(i => i.status === statusFilter);
    if (catFilter !== "Todos")    list = list.filter(i => i.category === catFilter);
    if (sortCol && sortDir) {
      list.sort((a, b) => {
        let av: string | number = "", bv: string | number = "";
        if (sortCol === "name")        { av = a.name;        bv = b.name; }
        else if (sortCol === "status") { av = a.status;      bv = b.status; }
        else if (sortCol === "qty")    { av = a.currentQty;  bv = b.currentQty; }
        else if (sortCol === "cost")   { av = a.unitCost;    bv = b.unitCost; }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [search, statusFilter, catFilter, sortCol, sortDir]);

  const critCount    = ITEMS.filter(i => i.status === "CRÍTICO").length;
  const vencCount    = ITEMS.filter(i => i.status === "VENCENDO").length;
  const totalValue   = ITEMS.reduce((s, i) => s + i.currentQty * i.unitCost, 0);

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />
      <main className="flex-1 ml-16 min-h-screen">

        {/* Topbar */}
        <div className="sticky top-0 z-20 border-b border-white/[0.06] px-6 py-4 flex items-center justify-between" style={{ background: "rgba(12,15,26,0.95)", backdropFilter: "blur(12px)" }}>
          <div className="flex items-center gap-3">
            <h1 className="text-white font-bold text-lg">Estoque</h1>
            <span className="text-white/25 text-sm">— Controle de Materiais</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowMovModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-white/50 border border-white/[0.08] hover:bg-white/[0.04] transition-colors">
              <History size={14} /> Movimentações
            </button>
            <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-[#1D9E75] hover:bg-[#18896A] transition-colors">
              <Plus size={14} /> Adicionar Item
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">

          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard icon={Boxes}         label="Total de itens"           value="29"       sub="itens cadastrados"        accent="#1D9E75" />
            <KpiCard icon={PackageX}      label="Itens críticos"           value={String(critCount)} sub="abaixo do mínimo" accent="#E24B4A" />
            <KpiCard icon={CalendarClock} label="Vencendo em 30 dias"      value={String(vencCount)} sub="requer atenção"  accent="#EF9F27" />
            <KpiCard icon={Tag}           label="Valor total em estoque"   value="R$ 4.820" sub="todos os itens"           accent="#5B8DEF" />
          </div>

          {/* Filters */}
          <div className="rounded-2xl border border-white/[0.06] p-4" style={{ background: "#131726" }}>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-44">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl text-sm text-white placeholder-white/25 border border-white/[0.08] focus:outline-none focus:border-[#1D9E75]/40 transition-colors"
                  style={{ background: "#0C0F1A" }} placeholder="Buscar por item ou fornecedor…"
                />
              </div>
              <div className="flex items-center gap-1.5">
                {STATUS_FILTER_CHIPS.map(({ label, value }) => (
                  <button key={value} onClick={() => setStatusFilter(value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${statusFilter === value ? "border-[#1D9E75] text-[#1D9E75] bg-[#1D9E75]/10" : "border-white/[0.08] text-white/40 hover:border-white/20"}`}>
                    {label}
                  </button>
                ))}
              </div>
              <select value={catFilter} onChange={e => setCatFilter(e.target.value as Category | "Todos")}
                className="rounded-xl px-3 py-2 text-xs text-white/60 border border-white/[0.08] focus:outline-none transition-colors" style={{ background: "#0C0F1A" }}>
                <option value="Todos">Todos</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: "#131726" }}>
            <table className="w-full">
              <thead className="border-b border-white/[0.06]" style={{ background: "rgba(255,255,255,0.02)" }}>
                <tr>
                  <SortTh col="status" sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Status</SortTh>
                  <SortTh col="name"   sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Item</SortTh>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Categoria</th>
                  <SortTh col="qty"    sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Qtd Atual</SortTh>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider whitespace-nowrap">Mín</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Unidade</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider w-32">Nível</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Validade</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-white/40 uppercase tracking-wider">Fornecedor</th>
                  <SortTh col="cost"  sortCol={sortCol} sortDir={sortDir} onSort={handleSort}>Custo Unit.</SortTh>
                  <th className="px-3 py-3 w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-white/30 text-sm">Nenhum item encontrado.</td></tr>
                ) : filtered.map(item => {
                  const cfg = STATUS_CFG[item.status];
                  const catCfg = CAT_CFG[item.category];
                  const pct = qtyPct(item);
                  const barColor = item.status === "CRÍTICO" ? "#E24B4A" : item.status === "VENCENDO" ? "#EF9F27" : "#1D9E75";
                  return (
                    <tr key={item.id}
                      style={{ background: cfg.rowBg }}
                      onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = cfg.rowHoverBg; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = cfg.rowBg; }}>
                      <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${catCfg.color}18` }}>
                            <catCfg.icon size={13} style={{ color: catCfg.color }} />
                          </div>
                          <span className="text-sm font-medium text-white whitespace-nowrap">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs text-white/50">{item.category}</td>
                      <td className="px-3 py-3 text-sm font-semibold" style={{ color: barColor }}>{item.currentQty}</td>
                      <td className="px-3 py-3 text-sm text-white/40">{item.minQty}</td>
                      <td className="px-3 py-3 text-xs text-white/50">{item.unit}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)", minWidth: 48 }}>
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: barColor }} />
                          </div>
                          <span className="text-xs text-white/35 w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {item.expiry
                          ? <span className={item.status === "VENCENDO" ? "font-semibold text-[#EF9F27]" : "text-white/50"}>{item.expiry}</span>
                          : <span className="text-white/25">—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <span className="flex items-center gap-1 text-xs text-white/50"><Truck size={10} /> {item.supplier}</span>
                      </td>
                      <td className="px-3 py-3 text-sm text-white/60 whitespace-nowrap">{fmtBRL(item.unitCost)}</td>
                      <td className="px-3 py-3"><RowMenu item={item} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between" style={{ background: "rgba(255,255,255,0.01)" }}>
              <p className="text-xs text-white/35">
                {filtered.length} de {ITEMS.length} itens exibidos
                {(statusFilter !== "Todos" || catFilter !== "Todos" || search) && (
                  <button onClick={() => { setSearch(""); setStatusFilter("Todos"); setCatFilter("Todos"); }}
                    className="ml-2 text-[#1D9E75] hover:text-[#5DCAA5] transition-colors">
                    Limpar filtros
                  </button>
                )}
              </p>
              <p className="text-xs text-white/35">
                Valor filtrado: <span className="font-semibold text-white/60">{fmtBRL(filtered.reduce((s, i) => s + i.currentQty * i.unitCost, 0))}</span>
              </p>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="grid grid-cols-2 gap-6">
            <AlertsPanel items={ITEMS} onOrder={() => setShowMovModal(true)} />
            <MovementsPanel onNew={() => setShowMovModal(true)} />
          </div>

        </div>
      </main>

      {showAddModal && <AddItemModal onClose={() => setShowAddModal(false)} />}
      {showMovModal && <RegisterMovModal onClose={() => setShowMovModal(false)} />}
    </div>
  );
}
