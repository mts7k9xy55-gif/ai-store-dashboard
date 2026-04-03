'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AppMetadata {
  id: number;
  title: string;
  description: string;
  repo_url: string;
  quality_score: number;
  status: string;
}

export default function Dashboard() {
  const [apps, setApps] = useState<AppMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [idea, setIdea] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

  const fetchApps = async () => {
    try {
      const res = await fetch(`${API_BASE}/apps`);
      if (res.ok) {
        const data = await res.json();
        setApps(data);
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // 実際に Worker の /apps (POST) へ送り、AI Factory のトリガーを引く
      const res = await fetch(`${API_BASE}/apps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: `Proposed: ${idea.slice(0, 20)}...`, 
          description: idea,
          repoUrl: 'Pending Generation'
        }),
      });

      if (res.ok) {
        setShowPublishModal(false);
        setIdea('');
        await fetchApps(); // 即座にリストを更新
      }
    } catch (error) {
      alert('AI Factory への接続に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white p-8 font-sans selection:bg-[#BFFF00] selection:text-black">
      <div className="max-w-6xl mx-auto space-y-16">
        
        <nav className="flex justify-between items-center text-sm font-mono text-gray-500">
          <div>ALLGO AI / STORE</div>
          <div className="flex space-x-6 items-center">
            <span className="text-[#BFFF00] flex items-center gap-2">
              <span className="w-2 h-2 bg-[#BFFF00] rounded-full animate-pulse"></span>
              {apps.length} Real Apps & Proposals
            </span>
          </div>
        </nav>

        <header className="text-center space-y-8 py-12">
          <motion.h1 initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-7xl md:text-9xl font-black tracking-tighter">
            IDEA TO <span className="text-[#BFFF00]">APP</span>
          </motion.h1>
          <p className="text-gray-400 text-2xl max-w-3xl mx-auto font-medium">
            あなたのアイデアを、一瞬で世界へ。<br />
            AI Factory が即座にコードを生成し、デプロイします。
          </p>
          <div className="pt-8">
            <button onClick={() => setShowPublishModal(true)} className="px-10 py-5 bg-[#BFFF00] text-black font-black text-xl rounded-full hover:scale-105 active:scale-95 transition-all">
              Ship Your Idea Now
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-80 bg-white/5 animate-pulse rounded-3xl"></div>)
          ) : (
            apps.map((app) => (
              <motion.div key={app.id} layout layoutId={String(app.id)} className={`bg-[#181818] p-10 rounded-[2.5rem] border ${app.repo_url === 'Pending Generation' ? 'border-dashed border-[#BFFF00]/30 opacity-80' : 'border-white/5'} hover:border-[#BFFF00]/50 transition-all group`}>
                <div className="flex justify-between items-center mb-6">
                  <div className={`text-[10px] font-mono tracking-widest uppercase px-2 py-1 rounded-md ${app.repo_url === 'Pending Generation' ? 'bg-white/10 text-white' : 'bg-[#BFFF00]/10 text-[#BFFF00]'}`}>
                    {app.repo_url === 'Pending Generation' ? 'Drafting...' : 'Live'}
                  </div>
                  <div className="text-xs font-mono text-gray-600">Score: {app.quality_score}</div>
                </div>
                <h3 className="text-3xl font-bold mb-4 group-hover:text-[#BFFF00] transition-colors">{app.title}</h3>
                <p className="text-gray-500 text-base leading-relaxed mb-10 h-24 overflow-hidden">{app.description}</p>
                <div className="flex items-center justify-between">
                  {app.repo_url !== 'Pending Generation' && <a href={app.repo_url} className="text-xs font-mono text-gray-600 hover:text-white underline underline-offset-4">Source Code ↗</a>}
                  <button className={`px-6 py-3 font-bold rounded-2xl transition-all ${app.repo_url === 'Pending Generation' ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-[#BFFF00]'}`}>
                    {app.repo_url === 'Pending Generation' ? 'Generating...' : 'Deploy'}
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </section>

        <AnimatePresence>
          {showPublishModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#181818] p-12 rounded-[3rem] border border-white/10">
                <h2 className="text-4xl font-black mb-4">Input Your Vision</h2>
                <p className="text-gray-400 mb-8 font-mono">Gemini 3.1 が即座に分析を開始し、PR を作成します。</p>
                <form onSubmit={handlePublish} className="space-y-6">
                  <textarea autoFocus required value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="e.g. ストライプ決済の結果を毎朝 Discord に要約して投げる Bot" className="w-full h-40 bg-black/50 border border-white/10 rounded-2xl p-6 outline-none focus:border-[#BFFF00] transition-colors text-lg" />
                  <div className="flex space-x-4">
                    <button type="submit" disabled={isSubmitting} className="flex-1 py-5 bg-[#BFFF00] text-black font-black rounded-2xl text-xl disabled:opacity-50">
                      {isSubmitting ? 'Transmitting...' : 'Ship to Factory'}
                    </button>
                    <button type="button" onClick={() => setShowPublishModal(false)} className="px-8 py-5 bg-white/5 rounded-2xl font-bold">Cancel</button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
