import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2, Volume2, Globe, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SupportedLanguage, SUPPORTED_LANGUAGES } from '../types';

interface AudioRecorderProps {
  onTranscriptionComplete: (audioBlob: Blob, language: SupportedLanguage) => void;
  isProcessing: boolean;
}

type AudioSource = 'mic' | 'system';

export default function AudioRecorder({ onTranscriptionComplete, isProcessing }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(SUPPORTED_LANGUAGES[0]);
  const [audioSource, setAudioSource] = useState<AudioSource>('mic');
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startRecording = async () => {
    try {
      let stream: MediaStream;
      
      if (audioSource === 'system') {
        // Use getDisplayMedia for system audio
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: true, // Required for audio capture in many browsers
          audio: true
        });
        
        // Ensure audio was captured
        if (stream.getAudioTracks().length === 0) {
          stream.getTracks().forEach(t => t.stop());
          throw new Error("No audio track found. Please ensure 'Share audio' was checked.");
        }
        
        // Stop video tracks immediately as we only want audio
        stream.getVideoTracks().forEach(track => track.stop());
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      setAudioStream(stream);
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        onTranscriptionComplete(audioBlob, selectedLanguage);
        if (timerRef.current) clearInterval(timerRef.current);
        setRecordingTime(0);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Start Visualizer
      setupVisualizer(stream);
    } catch (err: any) {
      console.error("Error accessing audio:", err);
      if (err.name === 'NotAllowedError') {
        alert("Permission denied. To record system audio, you must:\n1. Select a tab/window in the popup\n2. Check the 'Also share tab audio' box\n3. Click 'Share'");
      } else {
        alert(err.message || "Audio access denied or error occurred.");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      audioStream?.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const setupVisualizer = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 64;
    
    analyserRef.current = analyser;
    audioContextRef.current = audioContext;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!canvasRef.current || !analyserRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      analyserRef.current.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for(let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        
        // Gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#6366f1'); // indigo-500
        gradient.addColorStop(1, '#a855f7'); // violet-500
        
        ctx.fillStyle = isRecording ? gradient : '#cbd5e1';
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 mb-8 overflow-hidden relative">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex-1 space-y-6 w-full">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <Globe size={16} className="text-indigo-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Meeting Language</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  disabled={isRecording || isProcessing}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                    selectedLanguage.code === lang.code
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  } disabled:opacity-50`}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-3">
              <Volume2 size={16} className="text-indigo-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Audio Source</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setAudioSource('mic')}
                disabled={isRecording || isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  audioSource === 'mic'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                } disabled:opacity-50`}
              >
                <Mic size={14} />
                Microphone
              </button>
              <button
                onClick={() => setAudioSource('system')}
                disabled={isRecording || isProcessing}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                  audioSource === 'system'
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                } disabled:opacity-50`}
              >
                <Monitor size={14} />
                System Audio
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 shrink-0">
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 shadow-lg shadow-red-100' 
                  : 'bg-indigo-600 shadow-lg shadow-indigo-100'
              } relative z-10 disabled:opacity-50`}
            >
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="stop"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    <Square size={32} className="text-white fill-white" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                  >
                    {isProcessing ? (
                      <Loader2 size={40} className="text-white animate-spin" />
                    ) : (
                      audioSource === 'mic' ? <Mic size={40} className="text-white" /> : <Monitor size={40} className="text-white" />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
            
            {isRecording && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1.4, opacity: 0.2 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
                className="absolute inset-0 bg-red-400 rounded-full -z-0"
              />
            )}
          </div>
          
          <div className="text-center min-w-[120px]">
            <p className="text-2xl font-mono font-bold text-slate-900 tracking-tighter">
              {isRecording ? formatTime(recordingTime) : isProcessing ? 'AI...' : '00:00'}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              {isRecording && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {isRecording ? 'Live Recording' : isProcessing ? 'AI Processing' : 'Standby'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 h-12 transition-all duration-500 border-t border-slate-50 pt-4 ${isRecording ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 h-0 overflow-hidden mt-0'}`}>
        <canvas 
          ref={canvasRef} 
          width={800} 
          height={48} 
          className="w-full h-full rounded"
        />
      </div>
    </div>
  );
}
