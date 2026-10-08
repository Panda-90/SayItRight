import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';

export default function Home() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16 sm:py-24">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Say what you mean. <span className="text-indigo-600">Say it right.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-600 mb-10">
          An AI communication coach that helps you handle difficult conversations — and teaches you why the better version works.
        </p>
        <Link 
          to="/compose" 
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          Try SayRight <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Your message</h3>
            <div className="bg-red-50 text-red-900 p-4 rounded-2xl border border-red-100">
              "Sir I couldn't complete the assignment. Please give me 2 more days."
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-indigo-500 uppercase tracking-wider mb-2">SayRight</h3>
            <div className="bg-indigo-50 text-indigo-900 p-4 rounded-2xl border border-indigo-100">
              "Dear Professor, I apologize for not being able to complete the assignment on time. If possible, could you please allow me an additional two days to submit it?"
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 h-full flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <Lightbulb className="w-6 h-6" />
            <h3 className="font-bold text-lg text-slate-800">What you learned</h3>
          </div>
          <p className="text-slate-600 mb-4">
            When asking someone in a position of authority for an exception, avoid demanding the outcome directly.
          </p>
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 flex items-center justify-between shadow-sm">
            <span>Context</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span>Responsibility</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
            <span>Request</span>
          </div>
        </div>
      </div>
    </div>
  );
}
