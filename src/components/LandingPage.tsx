import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mic, Zap, Languages, Users, Shield, ArrowRight, PlayCircle } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const features = [
    {
      icon: <Mic className="text-indigo-600" size={24} />,
      title: "Voice to Text",
      description: "High-accuracy transcription powered by Gemini 3 Flash, capturing every word of your meetings."
    },
    {
      icon: <Users className="text-indigo-600" size={24} />,
      title: "Speaker ID",
      description: "Detects changes in voice patterns to distinguish between different attendees automatically."
    },
    {
      icon: <Zap className="text-indigo-600" size={24} />,
      title: "AI Summaries",
      description: "Get concise meeting notes, action items, and key decisions in seconds."
    },
    {
      icon: <Languages className="text-indigo-600" size={24} />,
      title: "Multi-Language",
      description: "Support for 10+ global languages including English, Spanish, French, Chinese, and more."
    },
    {
      icon: <PlayCircle className="text-indigo-600" size={24} />,
      title: "Audio Playback",
      description: "Original recordings are stored alongside summaries for quick verification of key points."
    },
    {
      icon: <Shield className="text-indigo-600" size={24} />,
      title: "Privacy First",
      description: "Your session history is stored locally in your browser, keeping your data secure and private."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight">MemoAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase bg-indigo-50 rounded-full border border-indigo-100">
              Next-Gen Meeting Intelligence
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-[1.1]">
              Turn your meetings into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Actionable Intelligence
              </span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Automated transcription, AI-powered summaries, and speaker identification for the modern professional. Join thousands of teams using MemoAI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                Start Transcribing Now
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={onLogin}
                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                View Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-12 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">99.8%</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">10+</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Languages</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">50ms</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Latency</p>
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">∞ Free</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Local Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Powerful Features for Professionals</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Everything you need to capture, organize, and act on your meeting discussions.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -5 }}
                className="p-8 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 border border-indigo-100">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white" size={18} />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">MemoAI</span>
          </div>
          <p className="text-slate-400 text-sm mb-8">© 2026 MemoAI Transcription Services. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest">Pricing</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-500 hover:text-indigo-600 uppercase tracking-widest">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
