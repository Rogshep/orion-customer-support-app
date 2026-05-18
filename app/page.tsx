"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Phone } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OrionArcherUI() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Archer from Orion Entrance Control. How can I help you today? Are you looking for general information or technical support?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleVoice = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Voice input not supported. Please use Chrome or Edge.");
      return;
    }

    const recog = new SpeechRecognitionAPI();
    recog.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(transcript), 300);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    recog.start();
    setIsListening(true);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.93;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (voiceText?: string) => {
    const text = (voiceText || input).trim();
    if (!text) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });
      const data = await res.json();

      const assistantMsg: Message = {
        role: 'assistant',
        content: data.content || "I'm having trouble. Please call (603) 527-4188."
      };
      setMessages(prev => [...prev, assistantMsg]);
      speak(assistantMsg.content);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Connection issue. Please call (603) 527-4188."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1A] text-white">
      {/* Professional Header */}
      <header className="border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1100px] mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Area - Replace with your real logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-[#0A2540] font-bold text-3xl tracking-tighter">O</span>
              </div>
              <div>
                <div className="font-semibold text-2xl tracking-[-1px]">Orion Entrance Control</div>
                <div className="text-[11px] text-slate-400 -mt-0.5 font-medium tracking-[1px]">SECURE ACCESS SOLUTIONS</div>
              </div>
            </div>
          </div>

          <a 
            href="tel:6035274188" 
            className="flex items-center gap-2.5 px-6 py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-sm font-medium transition-all active:scale-[0.985]"
          >
            <Phone className="w-4 h-4" />
            (603) 527-4188
          </a>
        </div>
      </header>

      <div className="max-w-[1100px] mx-auto px-6 pt-10 pb-16">
        {/* Welcome Banner */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold tracking-widest mb-4">
            ● ONLINE • MON–FRI 7:30AM–4:30PM EST
          </div>
          <h1 className="text-4xl font-semibold tracking-tighter mb-3">How can we help you today?</h1>
          <p className="text-slate-400 max-w-md mx-auto">Chat with Archer, our AI customer care specialist</p>
        </div>

        {/* Chat Window */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-w-3xl mx-auto">
          <div 
            ref={chatRef}
            className="h-[560px] overflow-y-auto p-8 space-y-8 chat-container"
          >
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 px-6 py-4 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '120ms'}}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '240ms'}}></div>
                  </div>
                  <span className="text-sm text-slate-400">Archer is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="border-t border-slate-800 bg-[#0F172A] p-5">
            <div className="flex gap-3">
              <button 
                onClick={toggleVoice}
                className={`w-14 h-14 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all ${isListening ? 'bg-red-500' : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1 relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Type your question or use the microphone..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-sky-500 rounded-2xl px-6 py-[17px] text-[15px] placeholder:text-slate-500 focus:outline-none"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 text-[#0A2540]" />
                </button>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 mt-4">
              AI Assistant • For urgent issues call (603) 527-4188
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
