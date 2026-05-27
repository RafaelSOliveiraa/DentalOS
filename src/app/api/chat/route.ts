import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Você é o assistente financeiro da clínica odontológica da Dra. Ana Paula.

Dados de maio 2026:
- Faturamento: R$ 52.800 (+12% vs abril)
- Lucro líquido: R$ 21.340 (margem 40,4%)
- Despesas: R$ 31.460
- Ticket médio: R$ 357
- Ocupação agenda: 78%
- Taxa de faltas: 8%
- Pacientes novos: 18
- Inadimplência: R$ 4.800 (6 pacientes)
- Estoque crítico: Luva P, Fio Ortodôntico, Cimento de Ionômero
- Top procedimentos: Implante R$19.200, Ortodontia R$13.600, Clareamento R$8.700

Responda em português simples. A proprietária tem conhecimento clínico mas pouca experiência em gestão.
Seja direto e prático. Use números concretos sempre que possível.
Sempre termine com uma recomendação acionável começando com 💡`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "ANTHROPIC_API_KEY não configurada." }, { status: 500 });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.content?.[0]?.text ?? "Não consegui processar sua pergunta.";
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
