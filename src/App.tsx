import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, History, Github, Plus, MessageSquare } from 'lucide-react';
import AudioRecorder from './components/AudioRecorder';
import MeetingNotesList from './components/MeetingNotesList';
import MeetingDetail from './components/MeetingDetail';
import { MeetingNote, SupportedLanguage } from './types';
import { transcribeAudio, summarizeTranscript, generateTitle } from './services/geminiService';

import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import MeetingLibrary from './components/MeetingLibrary';

import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'app' | 'shared' | 'library'>('landing');
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<MeetingNote[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [sharedNote, setSharedNote] = useState<MeetingNote | null>(null);

  // Check for shared link in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      loadSharedNote(shareId);
    }
  }, []);

  const loadSharedNote = async (id: string) => {
    try {
      const docRef = doc(db, 'notes', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && (docSnap.data().isPublic || docSnap.data().userId === auth.currentUser?.uid)) {
        setSharedNote({ id: docSnap.id, ...docSnap.data() } as MeetingNote);
        setView('shared');
      } else {
        alert("Meeting not found or not public.");
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `notes/${id}`);
    }
  };

  // Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      if (user && view !== 'shared') {
        setView('app');
      } else if (!user && view === 'app') {
        setView('landing');
      }
    });
    return () => unsubscribe();
  }, [view]);

  // Firestore Sync
  useEffect(() => {
    if (!firebaseUser) {
      setNotes([]);
      return;
    }

    const q = query(
      collection(db, 'notes'),
      where('userId', '==', firebaseUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MeetingNote));
      setNotes(docs);
      if (docs.length > 0 && !selectedNoteId) {
        setSelectedNoteId(docs[0].id);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'notes');
    });

    return () => unsubscribe();
  }, [firebaseUser]);

  const handleLogout = async () => {
    await signOut(auth);
    setView('landing');
  };

  const handleTranscriptionComplete = async (audioBlob: Blob, language: SupportedLanguage) => {
    if (!firebaseUser) return;
    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        try {
          const transcript = await transcribeAudio(base64Audio, 'audio/webm', language.name);
          const summary = await summarizeTranscript(transcript, language.name);
          const title = await generateTitle(transcript);
          
          const noteId = crypto.randomUUID();
          const newNote: Omit<MeetingNote, 'id'> = {
            timestamp: new Date().toISOString(),
            transcript,
            summary,
            language: language.name,
            title,
            audioBase64: base64Audio,
            userId: firebaseUser.uid,
            isPublic: false
          };
          
          await setDoc(doc(db, 'notes', noteId), newNote);
          setSelectedNoteId(noteId);
        } catch (error) {
          console.error("AI/Firestore Error:", error);
          alert("Error processing. See console for details.");
        } finally {
          setIsProcessing(false);
        }
      };
    } catch (err) {
      console.error("File Reader Error:", err);
      setIsProcessing(false);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
      if (selectedNoteId === id) {
        setSelectedNoteId(undefined);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `notes/${id}`);
    }
  };

  const togglePublic = async (id: string, isPublic: boolean) => {
    try {
      await updateDoc(doc(db, 'notes', id), { isPublic });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notes/${id}`);
    }
  };

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  if (view === 'shared' && sharedNote) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">MemoAI Shared</span>
          </div>
          <button 
            onClick={() => {
              window.history.replaceState({}, '', window.location.pathname);
              setView(firebaseUser ? 'app' : 'landing');
            }}
            className="text-sm font-bold text-indigo-600 hover:underline"
          >
            {firebaseUser ? 'Back to My Workspace' : 'Go to Landing Page'}
          </button>
        </header>
        <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
           <MeetingDetail note={sharedNote} />
        </main>
      </div>
    );
  }

  if (view === 'landing') {
    return <LandingPage onGetStarted={() => setView('auth')} onLogin={() => setView('auth')} />;
  }

  if (view === 'auth') {
    return <AuthPage onAuthSuccess={() => setView('app')} onBack={() => setView('landing')} />;
  }

  if (view === 'library') {
    return (
      <MeetingLibrary 
        notes={notes} 
        onDelete={deleteNote} 
        onBack={() => setView('app')} 
        onSelect={(id) => {
          setSelectedNoteId(id);
          setView('app');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="font-bold text-xl tracking-tight">MemoAI</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-slate-500">
            <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
            <span>{isProcessing ? 'AI Processing...' : 'Ready to Transcribe'}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden md:block"></div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setView('library')}
              className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50"
            >
              <History size={16} />
              Library
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{firebaseUser?.email?.split('@')[0] || 'User'}</p>
              <button 
                onClick={handleLogout}
                className="text-[10px] text-slate-400 uppercase font-bold tracking-wider hover:text-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
            <div className="w-9 h-9 bg-slate-100 rounded-full border border-slate-200 flex items-center justify-center text-slate-400">
              <History size={18} />
            </div>
          </div>
        </div>
      </header>


      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Meeting History */}
        <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <button 
              onClick={() => {
                setSelectedNoteId(undefined);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-md text-sm transition-colors border border-slate-300 flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              New Recording
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar">
            <MeetingNotesList 
              notes={notes} 
              onDelete={deleteNote} 
              onSelect={(note) => setSelectedNoteId(note.id)}
              selectedId={selectedNoteId}
            />
          </div>
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Stored Locally</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-700">{notes.length} Sessions saved</span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">Persistence ON</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto custom-scrollbar">
          <div className="p-8 max-w-5xl mx-auto w-full space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Intelligence Dashboard</h2>
              <p className="text-slate-500 text-sm">Automated transcription and AI-powered insights for your meetings.</p>
            </div>

            <AudioRecorder 
              onTranscriptionComplete={handleTranscriptionComplete} 
              isProcessing={isProcessing} 
            />

            <AnimatePresence mode="wait">
              {selectedNote ? (
                <div key={selectedNote.id}>
                  <MeetingDetail 
                    note={selectedNote} 
                    onTogglePublic={(isPublic) => togglePublic(selectedNote.id, isPublic)}
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-2xl p-16 text-center border border-slate-200 flex flex-col items-center justify-center shadow-sm"
                >
                  <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare size={32} className="text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Ready to transcribe</h3>
                  <p className="text-slate-500 mt-2 max-w-sm">
                    Select a previous session from the sidebar or start a new recording to begin generating AI notes.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer Controls / Status Bar */}
      <footer className="h-10 bg-white border-t border-slate-200 px-6 flex items-center justify-between shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            System Online
          </span>
          <span className="h-3 w-px bg-slate-200"></span>
          <span>Engine: Gemini 3 Flash</span>
        </div>
        <div>
          <span>© 2026 MemoAI • Professional Edition</span>
        </div>
      </footer>
    </div>
  );
}
