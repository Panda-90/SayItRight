import { useLocation, useNavigate } from 'react-router-dom';
import { Copy, Edit2, RotateCcw, Check, Lightbulb } from 'lucide-react';
import { useState } from 'react';

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  if (!location.state?.result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">No results found</h2>
        <button onClick={() => navigate('/compose')} className="text-indigo-600 font-medium hover:underline">
          Go back to compose
        </button>
      </div>
    );
  }

  const { result, originalMessage } = location.state;
  const { 
    rewritten_message, 
    scores, 
    changes, 
    lesson, 
    pattern, 
    pattern_steps,
    alternatives
  } = result;

  const handleCopy = () => {
    navigator.clipboard.writeText(rewritten_message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ScoreBar = ({ label, score }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm font-medium mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-900">{score}/10</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${score >= 8 ? 'bg-green-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'}`}
          style={{ width: `${score * 10}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      
      {/* Top Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Original */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Your Original Message</h3>
          <p className="text-slate-600 flex-1 whitespace-pre-wrap">{originalMessage}</p>
          <div className="mt-6">
            <button onClick={() => navigate('/compose')} className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1">
              <Edit2 className="w-4 h-4" /> Edit Original
            </button>
          </div>
        </div>

        {/* Improved */}
        <div className="bg-indigo-600 p-6 rounded-3xl border border-indigo-700 shadow-xl shadow-indigo-200 flex flex-col text-white">
          <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-4">Here's how you could say it</h3>
          <p className="text-xl font-medium leading-relaxed flex-1 whitespace-pre-wrap">{rewritten_message}</p>
          <div className="mt-6 flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-bold hover:bg-indigo-50 transition"
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              {copied ? 'Copied!' : 'Copy Text'}
            </button>
            <button onClick={() => navigate('/compose')} className="flex-1 text-center py-3 text-indigo-200 hover:text-white font-medium flex justify-center items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Left Column: Scores & Alternatives */}
        <div className="md:col-span-1 space-y-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">Tone Analysis</h3>
            <ScoreBar label="Respect" score={scores.respect} />
            <ScoreBar label="Clarity" score={scores.clarity} />
            <ScoreBar label="Professionalism" score={scores.professionalism} />
            <ScoreBar label="Empathy" score={scores.empathy} />
          </div>

          {alternatives && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Alternatives</h3>
              <div className="space-y-4">
                {alternatives.professional && alternatives.professional !== "N/A" && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">More Professional</h4>
                    <p className="text-sm text-slate-700 mt-1">{alternatives.professional}</p>
                  </div>
                )}
                {alternatives.warm && alternatives.warm !== "N/A" && (
                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 uppercase">Warmer</h4>
                    <p className="text-sm text-slate-700 mt-1">{alternatives.warm}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Explanations & Learning */}
        <div className="md:col-span-2 space-y-8">
          
          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-2xl text-amber-500 shadow-sm">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">Communication Lesson</h3>
                <p className="text-amber-800 leading-relaxed mb-4">{lesson}</p>
                <div className="bg-white/60 px-4 py-3 rounded-xl inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-amber-900">
                  {pattern_steps?.map((step, idx) => (
                    <span key={idx} className="flex items-center gap-2">
                      {step}
                      {idx < pattern_steps.length - 1 && <span className="text-amber-300">→</span>}
                    </span>
                  ))}
                  {(!pattern_steps || pattern_steps.length === 0) && pattern}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6">What Changed?</h3>
            <div className="space-y-6">
              {changes?.map((change, idx) => (
                <div key={idx} className="border-l-2 border-indigo-100 pl-4 relative">
                  <div className="absolute w-2 h-2 rounded-full bg-indigo-400 -left-[5px] top-2"></div>
                  <div className="grid sm:grid-cols-2 gap-4 mb-2">
                    <div className="bg-red-50 text-red-800 px-3 py-2 rounded-lg text-sm">
                      <span className="line-through opacity-70">{change.original}</span>
                    </div>
                    <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm">
                      {change.improved}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2"><span className="font-semibold text-slate-700">Why:</span> {change.reason}</p>
                </div>
              ))}
              {(!changes || changes.length === 0) && (
                <p className="text-slate-500">No major changes reported.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
