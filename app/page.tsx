"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Phone, Plus, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OrionSupportCenter() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm Archer, your Orion Tech support agent. To start a service ticket I will need your name, Who you work for, the product are you working on, And the site you are working on today? If you are just looking for information just let me know your name and company you work for"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
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
        content: data.content || "I'm having trouble right now. Please call (603) 527-4188."
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Connection issue. Please call (603) 527-4188."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      {/* Header */}
      <header className="bg-[#0F172A] border-b border-slate-800 px-8 py-5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div>
            <div className="font-semibold text-2xl tracking-tight">Support Center</div>
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              Archer System Online
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Ticket
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/15 rounded-xl text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <div className="max-w-3xl mx-auto px-6 pt-8 pb-32">
        <div 
          ref={chatRef}
          className="min-h-[500px] max-h-[600px] overflow-y-auto space-y-6 pr-2 chat-container"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] px-5 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-sky-500 text-white' 
                    : 'bg-[#1E2937] text-slate-200'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1E2937] px-5 py-4 rounded-2xl flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '120ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '240ms' }}></div>
                </div>
                <span className="text-sm text-slate-400">Archer is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A] border-t border-slate-800 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center bg-[#1E2937] rounded-2xl px-5 py-2 border border-slate-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your technical issue..."
              className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-slate-500 text-[15px] py-3"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="ml-3 w-10 h-10 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-600 rounded-xl flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-4 h-4 text-[#0A0F1E]" />
            </button>
          </div>
          <div className="text-center text-[10px] text-slate-500 mt-3">
            Archer AI strictly references Orionecl.com. Verify technical commands.
          </div>
        </div>
      </div>
    </div>
  );
}
