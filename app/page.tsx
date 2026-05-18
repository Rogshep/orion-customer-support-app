"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Phone, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OrionSupport() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm Archer from Orion Entrance Control. How can I help you today? Are you looking for general information or technical support?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const toggleVoice = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => handleSend(transcript), 300);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("Voice recognition failed. Please try again.");
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
    setIsListening(true);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (voiceInput?: string) => {
    const messageText = voiceInput || input.trim();
    if (!messageText) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.content || "I'm sorry, I'm having trouble right now. Please call (603) 527-4188." 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      speak(assistantMessage.content);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having connection issues. Please call Orion Customer Care at (603) 527-4188."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-sky-500 rounded-2xl flex items-center justify-center">
              <span className="text-slate-950 font-bold text-2xl">O</span>
            </div>
            <div>
              <div className="font-semibold text-2xl tracking-tight">Orion Entrance Control</div>
              <div className="text-sm text-slate-400 -mt-1">Archer AI Support</div>
            </div>
          </div>

          <a 
            href="tel:6035274188" 
            className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 rounded-full text-sm transition-all active:scale-95"
          >
            <Phone className="w-4 h-4" />
            <span className="font-medium">(603) 527-4188</span>
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-24">
        {/* Status Bar */}
        <div className="flex items-center justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            Online • Mon–Fri 7:30 AM – 4:30 PM EST
          </div>
        </div>

        {/* Chat Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
          <div 
            ref={chatContainerRef}
            className="h-[520px] overflow-y-auto p-6 space-y-6 chat-container"
          >
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed ${
                    message.role === 'user' 
                      ? 'bg-sky-500 text-white rounded-br-none' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 px-5 py-3.5 rounded-2xl rounded-bl-none flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-slate-400">Archer is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-800 bg-slate-900 p-4">
            <div className="flex gap-3">
              <button
                onClick={toggleVoice}
                disabled={isLoading}
                className={`flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question or tap the mic..."
                  className="w-full bg-slate-800 border border-slate-700 focus:border-sky-500 rounded-2xl px-6 py-4 text-white placeholder:text-slate-500 focus:outline-none pr-14 text-[15px]"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 rounded-xl flex items-center justify-center transition-all active:scale-95"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-500 mt-3">
              This is an AI assistant. For urgent technical issues, please call (603) 527-4188
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
