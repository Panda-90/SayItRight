import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          <span>SayRight</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link to="/compose" className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition">
            Try SayRight
          </Link>
        </div>
      </div>
    </nav>
  );
}
