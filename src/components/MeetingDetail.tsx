import React, { useState, useRef, useEffect } from 'react';
import { FileText, Sparkles, Copy, Check, Download, Languages, Clock, Play, Pause, Share2, Globe, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MeetingNote } from '../types';

interface MeetingDetailProps {
  note: MeetingNote;
  onTogglePublic?: (isPublic: boolean) => void;
}

export default function MeetingDetail({ note, onTogglePublic }: MeetingDetailProps) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Reset player when note changes
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [note.id]);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const copyToClipboard = () => {
    const text = activeTab === 'summary' ? note.summary : note.transcript;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadNote = () => {
    const content = `Title: ${note.title}\nDate: ${new Date(note.timestamp).toLocaleString()}\nLanguage: ${note.language}\n\nSUMMARY:\n${note.summary}\n\nTRANSCRIPT:\n${note.transcript}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '_')}_notes.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareLink = `${window.location.origin}${window.location.pathname}?share=${note.id}`;

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const isShared = note.isPublic === true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[650px] overflow-hidden"
    >
      <div className="p-6 border-b border-slate-100 bg-slate-50/30">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0 border border-indigo-100">
              <FileText size={24} />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-slate-900 truncate">{note.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={12} />
                  {new Date(note.timestamp).toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-tighter">
                  <Languages size={12} />
                  {note.language}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {note.audioBase64 && (
              <>
                <audio 
                  ref={audioRef} 
                  src={`data:audio/webm;base64,${note.audioBase64}`} 
                  onEnded={() => setIsPlaying(false)}
                />
                <button
                  onClick={togglePlayback}
                  className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-all shadow-sm ${
                    isPlaying 
                      ? 'bg-indigo-600 text-white border-indigo-600' 
                      : 'text-indigo-600 hover:bg-white border-slate-200'
                  }`}
                  title={isPlaying ? "Pause Recording" : "Play Recording"}
                >
                  {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
                </button>
                <div className="h-10 w-px bg-slate-200 mx-1"></div>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`w-10 h-10 flex items-center justify-center border rounded-lg transition-all shadow-sm ${
                  isShared 
                    ? 'bg-emerald-500 text-white border-emerald-500' 
                    : 'text-slate-400 hover:text-indigo-600 hover:bg-white border-slate-200'
                }`}
                title="Share this note"
              >
                <Share2 size={18} />
              </button>
              
              <AnimatePresence>
                {showShareMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-[60]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-slate-900">Share Meeting</h4>
                      <button onClick={() => setShowShareMenu(false)} className="text-slate-400 hover:text-slate-600">
                         <Lock size={14} />
                      </button>
                    </div>
                    
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                      Anyone with the link can view this meeting summary and transcript.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          onTogglePublic?.(!isShared);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          isShared 
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                            : 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isShared ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          {isShared ? <Globe size={14} /> : <Lock size={14} />}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold">{isShared ? 'Shared Publicly' : 'Private (Just You)'}</p>
                          <p className="text-[10px] opacity-70">Click to {isShared ? 'restrict' : 'enable'} sharing</p>
                        </div>
                      </button>

                      {isShared && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 truncate text-[10px] font-mono text-slate-400">
                            {shareLink}
                          </div>
                          <button
                            onClick={copyShareLink}
                            className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
                          >
                            {shareCopied ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-10 w-px bg-slate-200 mx-1"></div>

            <button
              onClick={copyToClipboard}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white border border-slate-200 rounded-lg transition-all shadow-sm"
              title="Copy to clipboard"
            >
              {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
            </button>
            <button
              onClick={downloadNote}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white border border-slate-200 rounded-lg transition-all shadow-sm"
              title="Download as .txt"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-1 p-1 bg-slate-200/50 rounded-xl border border-slate-200/50">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'summary' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Sparkles size={14} />
            SMART SUMMARY
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'transcript' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileText size={14} />
            TRANSCRIPTION
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 prose prose-slate max-w-none custom-scrollbar">
        <div className="flex items-center space-x-2 text-indigo-600 mb-6 pb-2 border-b border-indigo-50">
          <Sparkles size={14} className="animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-widest">AI Generated Content</span>
        </div>
        
        {activeTab === 'summary' ? (
          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-body text-sm">
            {note.summary || 'Generating summary...'}
          </div>
        ) : (
          <div className="whitespace-pre-wrap text-slate-600 leading-relaxed font-body text-sm">
            {note.transcript}
          </div>
        )}
      </div>

      <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
         <div className="flex items-center gap-2">
           <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
           <span className="text-[10px] font-bold text-slate-400 uppercase">Analysis Complete</span>
         </div>
         <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
           Refine with Gemini
         </button>
      </div>
    </motion.div>
  );
}
