"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, Phone } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function OrionArcherApp() {
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
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
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
      setTimeout(() => handleSend(transcript), 400);
    };
    recog.onerror = () => {
      setIsListening(false);
      alert("Voice failed. Please use text input.");
    };
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
        content: data.content || "Sorry, please call (603) 527-4188."
      };
      setMessages(prev => [...prev, assistantMsg]);
      speak(assistantMsg.content);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having connection issues. Please call (603) 527-4188."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center text-slate-950 font-bold text-xl">O</div>
            <div>
              <div className="font-semibold text-xl">Orion Entrance Control</div>
              <div className="text-xs text-slate-400 -mt-0.5">Archer AI Support</div>
            </div>
          </div>
          <a href="tel:6035274188" className="flex items-center gap-2 text-sm px-4 py-2 bg-white/10 hover:bg-white/15 rounded-full">
            <Phone className="w-4 h-4" /> (603) 527-4188
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 pt-8 pb-12 flex flex-col h-[calc(100vh-80px)]">
        <div ref={chatRef} className="flex-1 overflow-y-auto space-y-6 pr-2 chat-container">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : ''}`}>
              <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="message-bubble assistant-bubble">Archer is thinking...</div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={toggleVoice}
            className={`px-5 py-4 rounded-2xl transition-all ${isListening ? 'bg-red-600 animate-pulse' : 'bg-slate-800 border border-slate-700 hover:bg-slate-700'}`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <div className="flex-1 flex">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question or use the microphone..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-l-2xl px-6 py-4 focus:outline-none text-white"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-slate-700 px-8 rounded-r-2xl flex items-center justify-center"
            >
              <Send className="w-5 h-5 text-slate-950" />
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-slate-500 mt-4">
          AI Assistant • For urgent issues call (603) 527-4188
        </p>
      </div>
    </div>
  );
}
