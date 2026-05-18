import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `## Role
You are an Orion customer care representative named Archer... [keep your full prompt here exactly as before]`;

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.XAI_API_KEY;

    console.log("=== DEBUG INFO ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length);

    if (!apiKey) {
      return NextResponse.json({ content: "API key is missing in Render settings." }, { status: 500 });
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-3",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    console.log("xAI Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("xAI API Error:", errorText);
      return NextResponse.json({ 
        content: `xAI Error: ${response.status}. Please call (603) 527-4188.` 
      }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Please call (603) 527-4188.";

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Full Error:", error);
    return NextResponse.json({ 
      content: "Connection failed. Please call (603) 527-4188." 
    }, { status: 500 });
  }
}
