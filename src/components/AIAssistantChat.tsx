import React, { useState, useRef, useEffect } from 'react';
import { AssistantMessage, Destination } from '../types/travel';
import { Send, Sparkles, User, Bot, AlertCircle, MapPin, RefreshCw } from 'lucide-react';

interface AIAssistantChatProps {
  onSelectDestinationByName?: (name: string) => void;
  tripContextSummary?: string;
}

const STARTER_PROMPTS = [
  'How much does travel cost by Uber vs Rapido across my route?',
  'What are the dress codes and darshan timings for Kanakadurga Temple?',
  'How do I reach Undavalli Caves and what are the ticket prices?',
  'Suggest the best street food spots and Andhra thali meals.',
  'How should I plan a 2-day itinerary starting from my current location?',
];

export const AIAssistantChat: React.FC<AIAssistantChatProps> = ({
  onSelectDestinationByName,
  tripContextSummary,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Namaskaram & Welcome! I am your AI-TRAVELMATE Assistant. I provide verified facts, entrance fee calculations, Uber/Rapido transit estimates, and route recommendations for trips in India and worldwide. How can I assist your journey today?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          tripContext: tripContextSummary || 'Vijayawada travel exploration',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const assistantMsg: AssistantMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          groundedDestinations: data.groundedDestinations,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error?.message || 'Failed to get AI response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I am temporarily experiencing connection latency with the Gemini service. You can continue using the destination search, interactive map, Open-Meteo weather intelligence, and itinerary builder directly.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="font-display text-sm font-extrabold text-slate-900 leading-tight">
              AI Travel Concierge & Route Advisor
            </h3>
            <p className="text-[11px] text-slate-500">
              Grounded with live coordinates, entry tickets & real-time weather
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
          Gemini 3.8 Flash
        </span>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                  isUser ? 'bg-slate-900 text-white' : 'bg-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Grounded destination pills if any */}
                {msg.groundedDestinations && msg.groundedDestinations.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1 items-center">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Mentioned:</span>
                    {msg.groundedDestinations.map((dName, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => onSelectDestinationByName && onSelectDestinationByName(dName)}
                        className="text-[10px] text-indigo-700 hover:text-indigo-900 underline font-medium"
                      >
                        {dName}
                      </button>
                    ))}
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 font-mono text-right ${
                    isUser ? 'text-slate-400' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5 max-w-[85%] mr-auto">
            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl rounded-tl-none text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Synthesizing travel guidance...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters */}
      <div className="px-3 pt-2 pb-1 border-t border-slate-100 bg-white">
        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
          Suggested Questions
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about destinations, local food, timings, weather..."
          className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg transition-colors flex items-center justify-center shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
