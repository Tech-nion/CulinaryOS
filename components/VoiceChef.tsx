
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { InventoryItem } from '../types';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface VoiceChefProps {
  inventory: InventoryItem[];
}

export const VoiceChef: React.FC<VoiceChefProps> = memo(({ inventory }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);

  function decode(base64: string) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  }

  const stopSession = useCallback(async () => {
    setIsActive(false);
    setStatus('idle');
    setTranscript('');
    
    if (sessionPromiseRef.current) {
      const session = await sessionPromiseRef.current;
      session.close();
      sessionPromiseRef.current = null;
    }

    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    setIsConnecting(true);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const inventoryContext = inventory.map(i => `${i.name} (${i.quantity} ${i.unit})`).join(', ');

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            setStatus('listening');
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              // CRITICAL: Only send input after session connects
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              setStatus('speaking');
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) setStatus('listening');
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setStatus('listening');
            }
            if (message.serverContent?.outputTranscription) {
              setTranscript(message.serverContent.outputTranscription.text);
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => { console.error("Live Audio Error:", e); stopSession(); },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } 
          },
          systemInstruction: `You are the Culinary Assistant. You have access to these items: ${inventoryContext}. 
          Help with recipes, inventory tracking, and expiration warnings. 
          Respond in a warm, professional tone. If asked for global recipes, you can use your internal knowledge.`,
          outputAudioTranscription: {},
        }
      });
      sessionPromiseRef.current = sessionPromise;
    } catch (err) {
      console.error("Failed to start voice session:", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="fixed bottom-32 left-8 z-50">
      {isActive ? (
        <Card className="w-80 p-6 shadow-2xl bg-[#0f172a] border-emerald-500/30 animate-in zoom-in-95 duration-300 ring-8 ring-emerald-500/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-emerald-600 text-white shadow-lg ${status === 'listening' ? 'animate-pulse' : ''}`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
                  </svg>
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-white uppercase tracking-tight">Chef AI Voice</p>
                <Badge variant="success" className="text-[8px] py-0 px-1 bg-emerald-500/20 text-emerald-400 border-none">{status.toUpperCase()}</Badge>
              </div>
            </div>
            <button onClick={stopSession} className="text-slate-500 hover:text-white transition-colors" aria-label="End Voice Session">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
          
          <div className="h-20 overflow-hidden relative">
             <div className="flex gap-1 items-end justify-center h-full mb-2">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-1.5 bg-emerald-500 rounded-full transition-all duration-150 ${status === 'speaking' ? 'animate-bounce' : 'h-2 opacity-30'}`}
                    style={{ 
                      height: status === 'speaking' ? `${Math.random() * 30 + 10}px` : '6px',
                      animationDelay: `${i * 0.15}s` 
                    }}
                  />
                ))}
             </div>
             <p className="text-[10px] text-slate-400 font-medium italic text-center line-clamp-2">
               {transcript || "Speak to begin culinary processing..."}
             </p>
          </div>
        </Card>
      ) : (
        <button 
          onClick={startSession}
          disabled={isConnecting}
          aria-label="Start Voice Assistant"
          className="w-18 h-18 bg-[#0f172a] text-emerald-500 border border-emerald-500/30 rounded-[2rem] flex items-center justify-center shadow-2xl hover:scale-110 hover:rotate-3 transition-all duration-300 ring-8 ring-emerald-500/10 group"
        >
          {isConnecting ? (
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
          )}
        </button>
      )}
    </div>
  );
});
