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
`Ainda não há dados suficientes para esta análise.

Cadastre pacientes, agendamentos e registros financeiros para que eu possa identificar padrões e te ajudar com insights reais.`,

  "Qual procedimento tem maior margem?":
`Sem dados de procedimentos registrados ainda.

Quando você começar a registrar consultas e receitas, vou calcular a margem por tipo de procedimento e indicar onde focar.`,

  "Estou gastando demais em materiais?":
`Sem dados financeiros para analisar.

Registre suas despesas no módulo Financeiro e vou te avisar quando alguma categoria estiver acima do benchmark do setor.`,

  "Quanto preciso faturar para meta R$ 60k?":
`Configure sua meta mensal e comece a registrar receitas — vou acompanhar o progresso e te dizer quantas consultas faltam para atingi-la.`,

  "Quais pacientes estão inadimplentes?":
`Nenhum dado de inadimplência encontrado.

Quando houver parcelas em atraso registradas, vou listar os pacientes com o valor e os dias em aberto.`,

  "Como está minha ocupação de agenda?":
`Sem agendamentos registrados ainda.

Comece a agendar consultas e vou calcular a taxa de ocupação por dentista, dia da semana e período do mês.`,
};

const QUICK_CHIPS = Object.keys(CHIP_RESPONSES);

/* ─── Helpers ─── */
function nowTime() {
  return new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/* ─── SVG ─── */
import { Sidebar } from "@/components/Sidebar";

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
  content: `Olá! 👋\n\nQuando você começar a cadastrar pacientes e agendamentos, vou analisar os dados e te ajudar com insights da clínica.\n\nVocê já pode me fazer perguntas — estou conectado à IA e pronto para responder!`,
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
            <h2 className="text-white font-bold text-xl mb-1">Olá! Sou o assistente DentalOS</h2>
            <p className="text-white/50 text-sm max-w-md">
              Quando você começar a cadastrar pacientes e agendamentos, vou analisar os dados e te ajudar com insights da clínica.
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
