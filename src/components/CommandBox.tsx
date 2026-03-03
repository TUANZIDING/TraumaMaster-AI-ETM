import React, { useState, useRef, useEffect } from 'react';
import { GameLog } from '../game/types';
import { Send, Mic, MicOff } from 'lucide-react';
import { clsx } from 'clsx';

export function CommandBox({ 
  logs, 
  onCommand, 
  disabled, 
  placeholder = "输入指令 (例如: @Dr. B 准备止血带)" 
}: { 
  logs: GameLog[], 
  onCommand: (text: string) => void,
  disabled: boolean,
  placeholder?: string
}) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'zh-CN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        if (isListeningRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            console.error("Failed to restart recognition", e);
            setIsListening(false);
          }
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
        }
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListen = () => {
    if (isListening) {
      setIsListening(false);
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    
    onCommand(input.trim());
    setInput('');
    
    // Restart recognition to clear its internal transcript buffer
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col h-full overflow-hidden shadow-xl">
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className={clsx(
            "max-w-[85%] rounded-lg p-3 text-sm flex flex-col gap-1",
            log.sender === 'user' ? "bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 self-end" :
            log.sender === 'system' ? "bg-red-900/20 border border-red-500/30 text-red-200 self-center text-center w-full max-w-full" :
            log.sender === 'team' ? "bg-zinc-800 border border-zinc-700 text-zinc-300 self-start" :
            "bg-zinc-800 text-zinc-400 self-start"
          )}>
            <div className="flex justify-between items-center gap-4 opacity-50 text-[10px] uppercase font-mono">
              <span>{log.sender}</span>
              <span>T+{log.time}s</span>
            </div>
            <span>{log.text}</span>
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
      
      <div className="p-3 border-t border-zinc-800 bg-zinc-900">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <button
            type="button"
            onClick={toggleListen}
            disabled={disabled || !recognitionRef.current}
            className={clsx(
              "p-2 rounded-lg transition-colors flex items-center justify-center shrink-0",
              isListening ? "bg-red-500/20 text-red-500 animate-pulse" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
            )}
            title={!recognitionRef.current ? "浏览器不支持语音识别" : "语音输入"}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={disabled}
            placeholder={isListening ? "正在聆听..." : disabled ? "系统处理中..." : placeholder}
            className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
