import { useState } from 'react';
import { analyzeMessage } from '../services/api';
import { Sparkles, Copy, RotateCcw, Check, Wand2, Eraser } from 'lucide-react';

const TONES = [
  { id: 'base', label: 'Magic (Default)' },
  { id: 'casual', label: 'More Casual' },
  { id: 'formal', label: 'More Professional' },
  { id: 'confident', label: 'More Confident' },
  { id: 'flirty', label: 'More Flirty' },
  { id: 'shorter', label: 'Shorter' },
];

const RECIPIENTS = [
  { id: 'Professor', label: 'Professor' },
  { id: 'Recruiter', label: 'Recruiter' },
  { id: 'Friend', label: 'Friend' },
  { id: 'Manager', label: 'Manager' },
  { id: 'Colleague', label: 'Colleague' },
  { id: 'other', label: 'Other...' }
];

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [originalContext, setOriginalContext] = useState('');
  const [selectedTone, setSelectedTone] = useState('base');
  const [whoFor, setWhoFor] = useState('');
  const [customWhoFor, setCustomWhoFor] = useState('');

  const handleGenerate = async (actionOverride = null) => {
    const action = actionOverride || selectedTone;
    if (!message.trim() && action === 'base') return;
    
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        message: action === 'base' ? message : (result?.rewritten_message || message),
        action: action === 'base' ? null : action,
        context: action === 'base' ? null : originalContext,
        recipient: whoFor === 'other' ? customWhoFor : (whoFor || null)
      };

      if (action === 'base' || !originalContext) {
        setOriginalContext(message);
      }

      const res = await analyzeMessage(payload);
      setResult(res);
      // If we used an override (like the Regenerate button which passes 'regenerate'), don't change the dropdown.
      // But we can keep it as is.
    } catch {
      setError("We couldn't generate your message right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.rewritten_message) {
      navigator.clipboard.writeText(result.rewritten_message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClear = () => {
    setMessage('');
    setResult(null);
    setOriginalContext('');
    setError('');
    setWhoFor('');
    setCustomWhoFor('');
  };

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] font-sans text-gray-800 flex flex-col">
      
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 font-bold text-lg text-black">
            <div className="bg-black text-white p-1 rounded">
              <Sparkles className="w-5 h-5" />
            </div>
            SayItRight
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-500">
            <span className="text-black border-b-2 border-yellow-400 pb-1 cursor-pointer">Rewrite Tools</span>
            <div className="relative group cursor-pointer">
              <span className="hover:text-gray-900 flex items-center gap-1.5">
                Guides
                <span className="bg-emerald-100 text-emerald-600 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full">New</span>
              </span>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 text-xs cursor-default">
                <h4 className="font-bold text-gray-900 mb-2">How to use SayItRight:</h4>
                <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  <li>Type your raw thoughts in the left pane.</li>
                  <li>Select who the message is for (e.g., Professor).</li>
                  <li>Choose the perfect tone.</li>
                  <li>Click Convert to generate a polished message!</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
          <span className="cursor-pointer hover:text-gray-900">English</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center pt-6 pb-6 px-4 min-h-0">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-4 text-center shrink-0">
          <div className="border border-dashed border-gray-300 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-500 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Free to Use - No Sign-Up Required
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-gray-900 tracking-tight mb-2 font-bold">
            SayItRight
          </h1>
          <p className="text-gray-500 text-base md:text-lg">
            Rewrite your text in the tone that fits — professional, casual, concise, and more.
          </p>
        </div>

        {/* The Split Pane Editor */}
        <div className="w-full max-w-5xl bg-white border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col md:flex-row relative flex-1 min-h-0 mb-4 rounded-sm">
          
          {/* Decorative pseudo-border for bottom depth like the image */}
          <div className="absolute -bottom-2 -z-10 left-1 right-1 h-4 bg-gray-100 border border-gray-200 rounded-b-sm"></div>

          {/* LEFT PANE: INPUT */}
          <div className="flex-1 flex flex-col min-w-0 md:border-r border-dashed border-gray-200">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-gray-200">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Input Text <span className="font-normal ml-2">{message.length}/2000</span></span>
              <div className="flex items-center gap-3 text-gray-400">
                <button onClick={handleClear} className="hover:text-gray-600 transition-colors" title="Clear">
                  <Eraser className="w-4 h-4" />
                </button>
              </div>
            </div>
            {/* Editor */}
            <div className="flex-1 p-6 relative flex flex-col min-h-0">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
                placeholder="Enter your text here..."
                className="w-full flex-1 resize-none outline-none text-base text-gray-700 placeholder:text-gray-300"
              />
            </div>
            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white flex-wrap gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={whoFor}
                  onChange={(e) => setWhoFor(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 bg-white cursor-pointer min-w-[160px]"
                >
                  <option value="" disabled>Who is this for?</option>
                  {RECIPIENTS.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                
                {whoFor === 'other' && (
                  <input
                    type="text"
                    value={customWhoFor}
                    onChange={(e) => setCustomWhoFor(e.target.value)}
                    placeholder="E.g., Father"
                    className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 bg-white min-w-[140px]"
                  />
                )}

                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="border border-gray-300 rounded px-4 py-2 text-sm text-gray-700 outline-none focus:border-gray-400 bg-white cursor-pointer min-w-[180px]"
                >
                  {TONES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => handleGenerate()}
                disabled={!message.trim() || loading}
                className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded text-sm font-bold disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {loading ? 'Processing...' : <><Wand2 className="w-4 h-4" /> Convert</>}
              </button>
            </div>
          </div>

          {/* RIGHT PANE: OUTPUT */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-dashed border-gray-200 bg-white">
              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Output Text</span>
              {result && !loading && (
                <div className="flex items-center gap-3 text-gray-400">
                  <button onClick={handleCopy} className="hover:text-gray-600 transition-colors flex items-center gap-1" title="Copy">
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
            {/* Editor / Empty State */}
            <div className="flex-1 p-6 relative flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-gray-400 animate-spin"></div>
                  <p className="text-sm italic font-serif">Refining your text...</p>
                </div>
              ) : result ? (
                <>
                  <textarea
                    value={result.rewritten_message}
                    onChange={(e) => setResult({ ...result, rewritten_message: e.target.value })}
                    className="w-full flex-1 resize-none outline-none text-base text-gray-700 bg-transparent"
                  />
                  {/* Subtle Tone indicator & extra actions */}
                  <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detected Tone:</span>
                      <span className="text-xs text-gray-600 bg-gray-200 px-2 py-0.5 rounded">{result.tone?.primary || 'Neutral'}</span>
                    </div>
                    <button 
                      onClick={() => handleGenerate('regenerate')}
                      className="text-xs font-bold text-gray-500 hover:text-gray-800 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <div className="w-12 h-12 rounded-full border border-dashed border-gray-300 flex items-center justify-center bg-white">
                    <Wand2 className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm italic font-serif text-gray-400 max-w-[200px] text-center">
                    Your converted text will appear here
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 text-red-600 rounded text-sm w-full max-w-5xl text-center border border-red-100">
            {error}
          </div>
        )}

      </main>

    </div>
  );
}
