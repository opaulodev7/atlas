import React from 'react';
import { Menu, Sparkles, Plus, Calendar, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC<{ onToggleSidebar: () => void }> = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <span className="capitalize">{formattedDate}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Checkin Action */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/checkin')}
          icon={<Activity className="w-4 h-4 text-emerald-400" />}
          className="hidden sm:inline-flex"
        >
          Check-in Diário
        </Button>

        {/* Quick Ask AI Action */}
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/ai')}
          icon={<Sparkles className="w-4 h-4 text-slate-950" />}
        >
          Perguntar ao Atlas AI
        </Button>
      </div>
    </header>
  );
};
