import React, { useState } from 'react';
import { FileText, ClipboardList, Clock, Trash2, CheckCircle2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { MeetingNote } from '../types';

interface MeetingNotesListProps {
  notes: MeetingNote[];
  onDelete: (id: string) => void;
  onSelect: (note: MeetingNote) => void;
  selectedId?: string;
}

export default function MeetingNotesList({ notes, onDelete, onSelect, selectedId }: MeetingNotesListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400 text-center">
        <Clock size={32} className="mb-3 opacity-30" />
        <p className="text-xs font-bold uppercase tracking-widest">No sessions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="px-3 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search meetings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Sessions</p>
      
      <div className="grid gap-1">
        {filteredNotes.map((note) => (
          <motion.div
            layout
            key={note.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`group relative px-4 py-4 cursor-pointer transition-all border-l-4 ${
              selectedId === note.id
                ? 'bg-indigo-50 border-indigo-600 shadow-sm'
                : 'bg-white border-transparent hover:bg-slate-50'
            }`}
            onClick={() => onSelect(note)}
          >
            <div className="flex justify-between items-start mb-1">
              <div className="flex-1 min-w-0 pr-6">
                <h4 className={`text-sm font-bold truncate ${selectedId === note.id ? 'text-slate-900' : 'text-slate-700'}`}>
                  {note.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${selectedId === note.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {note.language}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                    {new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {note.summary && (
                  <p className={`text-[11px] line-clamp-2 mt-2 leading-relaxed ${selectedId === note.id ? 'text-indigo-600/70' : 'text-slate-400'}`}>
                    {note.summary.replace(/[#*]/g, '')}
                  </p>
                )}
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note.id);
                }}
                className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
