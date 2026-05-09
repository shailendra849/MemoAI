import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Calendar, Languages, Trash2, ExternalLink, ArrowLeft, MoreVertical, FileText, Sparkles, Filter } from 'lucide-react';
import { MeetingNote } from '../types';

interface MeetingLibraryProps {
  notes: MeetingNote[];
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  onBack: () => void;
}

export default function MeetingLibrary({ notes, onDelete, onSelect, onBack }: MeetingLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLang, setFilterLang] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const languages = Array.from(new Set(notes.map(n => n.language)));

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          note.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLang === 'all' || note.language === filterLang;
    return matchesSearch && matchesLang;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-slate-200"></div>
          <h1 className="text-lg font-bold text-slate-900">Session Library</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
            {notes.length} TOTAL SESSIONS
          </div>
        </div>
      </header>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {/* Filters Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-end">
          <div className="flex-1 w-full">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Search Library</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search by title, keywords or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
          </div>
          
          <div className="w-full md:w-64">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Filter by Language</label>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={filterLang}
                onChange={(e) => setFilterLang(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none appearance-none font-bold text-xs"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="popLayout">
          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note) => (
                <motion.div
                  layout
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col"
                >
                  <div className="p-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <FileText size={20} />
                      </div>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase tracking-tighter">
                          {note.language}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-2 leading-tight">
                      {note.title}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                      <Calendar size={12} />
                      {new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-3 leading-relaxed italic mb-4">
                      "{note.summary.replace(/[#*]/g, '').slice(0, 150)}..."
                    </p>
                  </div>

                  <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <button 
                      onClick={() => onSelect(note.id)}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
                    >
                      View Details
                      <ExternalLink size={12} />
                    </button>
                    
                    <button 
                      onClick={() => setShowDeleteConfirm(note.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Inline Delete Confirmation */}
                  <AnimatePresence>
                    {showDeleteConfirm === note.id && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm p-6 flex flex-col items-center justify-center text-center z-10"
                      >
                        <Trash2 size={32} className="text-red-500 mb-4" />
                        <h4 className="font-bold text-slate-900 mb-1">Delete this session?</h4>
                        <p className="text-xs text-slate-500 mb-6 px-4">This action is permanent and will remove all transcripts and summaries.</p>
                        <div className="flex gap-3 w-full">
                          <button 
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              onDelete(note.id);
                              setShowDeleteConfirm(null);
                            }}
                            className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 text-slate-300">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No meetings found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try adjusting your search query or language filters to find what you're looking for.</p>
              <button 
                onClick={() => {setSearchQuery(''); setFilterLang('all');}}
                className="mt-6 text-sm font-bold text-indigo-600 hover:underline"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
