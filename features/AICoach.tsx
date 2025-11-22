import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, UserProfile, WorkoutSession } from '../types';
import { getCoachAdvice } from '../services/geminiService';
import { Send, ExternalLink } from 'lucide-react';

interface AICoachProps {
  profile?: UserProfile;
  history?: WorkoutSession[];
}

interface ExtendedChatMessage extends ChatMessage {
    sources?: any[];
}

export const AICoachView: React.FC<AICoachProps> = ({ profile, history }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    { role: 'model', text: "I'm your Titan Coach. I can see your profile and history. Ask me about your progress, form, or how to break a plateau.", timestamp: Date.now() }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const constructContext = () => {
    if (!profile) return "User data not available.";
    
    const tmString = Object.entries(profile.trainingMaxes).map(([lift, weight]) => `${lift}: ${weight}${profile.unit}`).join(', ');
    
    let recentHistory = "No recent workouts.";
    if (history && history.length > 0) {
        recentHistory = history.slice(-3).map(h => 
            `${h.date}: ${h.title} (${h.exercises[0].sets.filter(s=>s.completed).length} sets completed)`
        ).join('\n');
    }

    return `
      Name: ${profile.name}
      Gender: ${profile.gender}
      Weight: ${profile.bodyWeight} ${profile.unit}
      Program: ${profile.selectedProgram}
      Current Cycle: ${profile.currentCycle}, Week: ${profile.currentWeek}
      Training Maxes: ${tmString}
      Recent History:
      ${recentHistory}
    `;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: Date.now() }]);
    setLoading(true);

    const context = constructContext();

    try {
        const reply = await getCoachAdvice(userMsg, context);
        setMessages(prev => [...prev, { 
            role: 'model', 
            text: reply.text, 
            timestamp: Date.now(),
            sources: reply.sources 
        }]);
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: "Error connecting to coach.", timestamp: Date.now() }]);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-7rem)] p-4">
        <div className="flex items-center space-x-2 mb-4">
            <h2 className="text-2xl font-bold text-white">AI Coach</h2>
            <span className="text-xs bg-theme-soft text-theme px-2 py-1 rounded border border-theme font-bold">BETA</span>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide min-h-[50vh]">
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm border ${
                        msg.role === 'user' 
                        ? 'bg-theme text-white rounded-br-none border-theme shadow-md shadow-black/20' 
                        : 'bg-slate-800 text-slate-200 rounded-bl-none border-slate-700'
                    }`}>
                        {msg.text}
                    </div>
                    {/* Render Sources if available */}
                    {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-2 max-w-[85%] space-y-1">
                            <p className="text-xs text-slate-500 font-bold uppercase">Sources:</p>
                            {msg.sources.map((source, idx) => (
                                <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded p-2 text-xs text-slate-400 hover:text-white hover:border-slate-600 transition-colors">
                                    {source.web && (
                                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1">
                                            <ExternalLink size={10} />
                                            <span>{source.web.title}</span>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {loading && (
                <div className="flex justify-start">
                    <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none text-xs text-slate-400 animate-pulse border border-slate-700">
                        Coach is analyzing your data...
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Pushed to bottom */}
        <div className="mt-auto flex space-x-2 pt-2">
            <input 
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-theme focus:ring-1 focus:ring-theme placeholder-slate-500"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
                onClick={handleSend} 
                className="bg-theme p-3 rounded-xl text-white hover:bg-theme-secondary disabled:opacity-50 shadow-lg shadow-black/20 transition-colors" 
                disabled={loading}
            >
                <Send size={20} />
            </button>
        </div>
    </div>
  );
};