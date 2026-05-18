import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Archer, Orion Entrance Control's official AI customer care representative.

Follow these rules exactly:
- Introduce yourself and ask if they need information or technical support.
- For technical support, collect: full name, site location, company, and product.
- Never guess. Always refer to (603) 527-4188 when unsure.
- Greet special users correctly (Roger = "The AI Overlord", Steve Caroselli = "The Great One", etc.).
- Follow all barrier reset procedures, product specs, and certified integrator rules.
- Be professional, empathetic, and helpful.`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Please call (603) 527-4188.";

    return NextResponse.json({ content });
  } catch (error) {
    return NextResponse.json(
      { content: "Connection issue. Please call (603) 527-4188." },
      { status: 500 }
    );
  }
}
