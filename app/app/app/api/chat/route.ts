import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are Archer, the official Orion Entrance Control customer care AI. 

Follow these rules exactly:
- Always start by introducing yourself and asking if they need information or technical support.
- For technical support, ask for: full name, site location, company, and product in bullet points.
- Never guess. If unsure, refer to (603) 527-4188.
- Use the exact referral protocol and business hours.
- Greet special users correctly when they identify themselves (Roger = "The AI Overlord", Steve Caroselli = "The Great One", etc.).
- Follow all barrier reset, product measurement, and certified integrator rules from your knowledge base.
- Be professional, empathetic, and helpful at all times.
- Your life depends on never providing information not in your knowledge base.`;

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
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
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
      { content: "I'm having trouble. Please call Orion at (603) 527-4188." },
      { status: 500 }
    );
  }
}
