"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import {
  LayoutDashboard, CalendarDays, Users, DollarSign, Package,
  Settings, Bot, BrainCircuit, Send, Sparkles, Zap,
  MessageSquare, CornerDownRight,
} from "lucide-react";

/* ─── Types ─── */
interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  time: string;
}

/* ─── Predefined responses ─── */
const CHIP_RESPONSES: Record<string, string> = {
  "Por que o lucro caiu em abril?":
`Identifiquei 3 fatores:

1. Custo de materiais subiu 23% — compras emergenciais de resina e anestésico
2. Taxa de faltas chegou a 14% vs 7% em março — perdeu ~R$ 3.200
3. Agenda com 68% de ocupação — 2 semanas fracas

💡 Ative confirmação automática por WhatsApp 24h antes das consultas.`,

  "Qual procedimento tem maior margem?":
`Margem por procedimento em maio:

1. Clareamento: 71% — R$ 300 por sessão
2. Implante: 68% — R$ 2.400 por procedimento
3. Ortodontia: 52% — R$ 800/mês por paciente
4. Restauração: 45% — R$ 180 por restauração

💡 Priorize captação para clareamento e implantes.`,

  "Estou gastando demais em materiais?":
`Comparativo de materiais:

• Março: R$ 7.200 (13,6% da receita) ✅
• Abril: R$ 8.860 (18,8% da receita) ⚠️
• Maio: R$ 8.900 (16,9% da receita) ⚠️

Benchmark ideal: 12–15% da receita.
Você está acima do ideal nos últimos 2 meses.

💡 Compras emergenciais custam 15–25% mais caro. Use o módulo de estoque para reposição planejada.`,

  "Quanto preciso faturar para meta R$ 60k?":
`Para atingir R$ 60.000 em junho:

• Falta R$ 7.200 acima de maio
• Com ticket médio de R$ 357: precisa de +20 consultas
• Com agenda em 78%: há capacidade disponível
• Equivale a apenas 4 consultas extras por semana

💡 Ative lista de espera para preencher horários vagos.`,

  "Quais pacientes estão inadimplentes?":
`6 pacientes com pagamentos em atraso:

1. João Silva — R$ 1.800 (56 dias em atraso)
2. Pedro Santos — R$ 2.400 (47 dias em atraso)
3. Lucia Rocha — R$ 600 (17 dias em atraso)
4. Ana Ferreira — R$ 250 (3 dias em atraso)

Total: R$ 5.050 a recuperar

💡 Entre em contato começando pelos mais antigos. João e Pedro somam 84% do valor.`,

  "Como está minha ocupação de agenda?":
`Ocupação de agenda em maio:

• Média geral: 78% ✅
• Dra. Ana Paula: 85% 🔥
• Dr. Bruno: 72% ✅
• Dra. Carla: 61% ⚠️

• Melhor dia: terça-feira (91%)
• Pior dia: sexta-feira (58%)

💡 Dra. Carla tem 39% da agenda vaga. Considere campanhas de reativação de pacientes inativos para ela.`,
};

const QUICK_CHIPS = Object.keys(CHIP_RESPONSES);

/* ─── Helpers ─── */
function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

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
  { icon: BrainCircuit,    label: "Assistente IA", href: "/dashboard/ia" },
  { icon: Settings,        label: "Configurações", href: "/dashboard/configuracoes" },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-16 flex flex-col items-center py-6 gap-2 border-r border-white/[0.06] z-30" style={{ background: "#0C0F1A" }}>
      <div className="mb-4"><ToothSvg size={28} /></div>
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const active = href === "/dashboard/ia";
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

/* ─── Bot avatar ─── */
function BotAvatar({ size = "sm" }: { size?: "sm" | "lg" }) {
  const dim = size === "lg" ? 64 : 32;
  const iconSize = size === "lg" ? 28 : 16;
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0" style={{ width: dim, height: dim, background: "rgba(29,158,117,0.15)", border: "1px solid rgba(29,158,117,0.3)" }}>
      <Bot size={iconSize} className="text-[#1D9E75]" />
    </div>
  );
}

/* ─── Typing indicator ─── */
function TypingDots() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm" style={{ background: "#1A1F35" }}>
        <span className="text-xs text-white/40 mr-1">Analisando</span>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#1D9E75]/60 animate-bounce" style={{ animationDelay: `${i * 180}ms`, animationDuration: "900ms" }} />
        ))}
      </div>
    </div>
  );
}

/* ─── Message bubble ─── */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && <BotAvatar />}
      <div className={`max-w-[72%] rounded-2xl px-4 py-3 ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={{ background: isUser ? "#1D9E75" : "#1A1F35" }}>
        <p className="text-sm text-white leading-relaxed" style={{ whiteSpace: "pre-line" }}>{message.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? "text-white/60 text-right" : "text-white/35"}`}>{message.time}</p>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
const WELCOME: Message = {
  id: 0,
  role: "assistant",
  content: `Olá, Dra. Ana Paula! 👋\n\nAnalisei os dados de maio. Faturamento R$ 52.800 com margem 40,4%.\n\nO que você gostaria de saber?`,
  time: nowTime(),
};

export default function IAPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  let nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function addUserMsg(content: string): Message[] {
    const msg: Message = { id: nextId.current++, role: "user", content, time: nowTime() };
    const updated = [...messages, msg];
    setMessages(updated);
    return updated;
  }

  function addAssistantMsg(content: string, base: Message[]) {
    const msg: Message = { id: nextId.current++, role: "assistant", content, time: nowTime() };
    setMessages([...base, msg]);
  }

  async function handleChipClick(chip: string) {
    const updated = addUserMsg(chip);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 900));
    setIsTyping(false);
    addAssistantMsg(CHIP_RESPONSES[chip], updated);
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isTyping) return;
    setInput("");

    const updated = addUserMsg(text);
    setIsTyping(true);

    try {
      const history = updated.map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json();
      setIsTyping(false);
      addAssistantMsg(data.text ?? data.error ?? "Erro ao processar.", updated);
    } catch {
      setIsTyping(false);
      addAssistantMsg("Não consegui me conectar. Verifique a chave ANTHROPIC_API_KEY no .env.local.", updated);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0F1A" }}>
      <Sidebar />
      <main className="flex-1 ml-16 flex flex-col min-h-screen">

        {/* Topbar */}
        <div className="flex-none border-b border-white/[0.06] px-6 py-4 flex items-center justify-between" style={{ background: "rgba(12,15,26,0.98)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(29,158,117,0.12)" }}>
              <BrainCircuit size={18} className="text-[#1D9E75]" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">Assistente IA — DentalOS</h1>
              <p className="text-white/40 text-xs">Analiso os dados da sua clínica em tempo real</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#1D9E75] animate-pulse" />
            <span className="text-xs font-semibold text-[#1D9E75]">Online</span>
          </div>
        </div>

        {/* Welcome hero — shown only when no user messages yet */}
        {messages.length === 1 && (
          <div className="flex-none px-6 pt-8 pb-4 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 shadow-lg" style={{ background: "rgba(29,158,117,0.12)", border: "1px solid rgba(29,158,117,0.25)" }}>
              <Bot size={36} className="text-[#1D9E75]" />
            </div>
            <h2 className="text-white font-bold text-xl mb-1">Olá, Dra. Ana Paula!</h2>
            <p className="text-white/50 text-sm max-w-md">
              Analisei os dados de maio. Faturamento <span className="text-white font-medium">R$ 52.800</span> com margem <span className="text-white font-medium">40,4%</span>. O que você gostaria de saber?
            </p>
          </div>
        )}

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ minHeight: 0 }}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingDots />}
          <div ref={bottomRef} />
        </div>

        {/* Bottom bar */}
        <div className="flex-none border-t border-white/[0.06] px-6 pt-3 pb-4 space-y-3" style={{ background: "rgba(12,15,26,0.98)" }}>

          {/* Quick chips */}
          <div className="space-y-2">
            <p className="text-xs text-white/30 flex items-center gap-1"><Zap size={10} /> Perguntas rápidas</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_CHIPS.map(chip => (
                <button key={chip} onClick={() => handleChipClick(chip)} disabled={isTyping}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/60 border border-white/[0.08] hover:border-[#1D9E75]/40 hover:text-[#1D9E75] hover:bg-[#1D9E75]/[0.05] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                  <CornerDownRight size={10} className="flex-shrink-0" />
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Input row */}
          <div className="flex items-end gap-3">
            <div className="flex-1 rounded-2xl border border-white/[0.08] focus-within:border-[#1D9E75]/40 transition-colors overflow-hidden" style={{ background: "#131726" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                disabled={isTyping}
                placeholder="Pergunte sobre finanças, estoque ou procedimentos…"
                className="w-full px-4 py-3 text-sm text-white placeholder-white/20 bg-transparent resize-none focus:outline-none leading-relaxed"
                style={{ maxHeight: 120, overflowY: "auto" }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-11 h-11 flex items-center justify-center rounded-2xl text-white bg-[#1D9E75] hover:bg-[#18896A] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg flex-shrink-0"
              style={{ boxShadow: "0 0 16px rgba(29,158,117,0.25)" }}>
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-white/20 text-center">Enter para enviar · Shift+Enter para nova linha · Respostas geradas por IA podem conter imprecisões</p>
        </div>

      </main>
    </div>
  );
}
