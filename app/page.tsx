"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Phone, ArrowLeft } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OrionChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Archer from Orion Entrance Control. How can I help you today?"
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
      setTimeout(() => handleSend(transcript), 250);
    };
    recog.onerror = () => setIsListening(false);
    recog.onend = () => setIsListening(false);

    recog.start();
    setIsListening(true);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
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
        content: data.content || "I'm having trouble right now. Please call (603) 527-4188."
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
    <div className="min-h-screen bg-[#0B0F1A] flex flex-col">
      {/* Header */}
      <div className="bg-[#111827] border-b border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Logo Placeholder - Replace with your real logo */}
            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center">
              <span className="text-[#0B0F1A] font-bold text-2xl">O</span>
            </div>
            <div>
              <div className="font-semibold text-xl tracking-tight">Orion Entrance Control</div>
              <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                Archer AI • Online
              </div>
            </div>
          </div>
        </div>

        <a 
          href="tel:6035274188" 
          className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-2xl text-sm font-medium transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Support
        </a>
      </div>

      {/* Chat Area */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 pt-6 pb-24 overflow-hidden flex flex-col">
        <div 
          ref={chatRef}
          className="flex-1 overflow-y-auto space-y-6 px-2 chat-container"
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] px-5 py-3.5 text-[15px] leading-relaxed rounded-3xl ${
                  msg.role === 'user' 
                    ? 'bg-sky-500 text-white rounded-br-lg' 
                    : 'bg-[#1E2937] text-slate-200 rounded-bl-lg'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#1E2937] px-5 py-3.5 rounded-3xl rounded-bl-lg flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm text-slate-400">Archer is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="max-w-3xl mx-auto w-full px-4 pb-8 sticky bottom-0 bg-[#0B0F1A]">
        <div className="bg-[#111827] border border-slate-700 rounded-3xl p-3 flex items-center gap-3 shadow-xl">
          <button
            onClick={toggleVoice}
            className={`w-12 h-12 flex-shrink-0 rounded-2xl flex items-center justify-center transition-all ${
              isListening 
                ? 'bg-red-500 text-white' 
                : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Message Archer..."
            className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder:text-slate-500 text-[15px] py-3"
            disabled={isLoading}
          />

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 flex-shrink-0 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 rounded-2xl flex items-center justify-center transition-all active:scale-95"
          >
            <Send className="w-5 h-5 text-[#0B0F1A]" />
          </button>
        </div>

        <div className="text-center text-[10px] text-slate-500 mt-3">
          AI Assistant • For urgent issues call (603) 527-4188
        </div>
      </div>
    </div>
  );
}
