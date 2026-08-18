import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Flame,
  CheckSquare,
  Target,
  FolderKanban,
  BookOpen,
  ListOrdered,
  Bot,
  BarChart3,
  History,
  GitBranch,
  Compass,
  User,
  Settings,
  LogOut,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  highlight?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/checkin', label: 'Check-in Diário', icon: Activity, badge: 'Hoje' },
      { to: '/habits', label: 'Hábitos', icon: Flame },
      { to: '/tasks', label: 'Tarefas', icon: CheckSquare },
    ],
  },
  {
    title: 'Estratégia & Execução',
    items: [
      { to: '/goals', label: 'Objetivos', icon: Target },
      { to: '/projects', label: 'Projetos', icon: FolderKanban },
      { to: '/plans', label: 'Planos de Ação', icon: ListOrdered },
      { to: '/areas', label: 'Áreas da Vida', icon: Compass },
    ],
  },
  {
    title: 'Inteligência & Reflexão',
    items: [
      { to: '/ai', label: 'Atlas AI', icon: Bot, highlight: true },
      { to: '/reports', label: 'Relatório Semanal', icon: BarChart3 },
      { to: '/journal', label: 'Diário Pessoal', icon: BookOpen },
      { to: '/decisions', label: 'Decisões', icon: GitBranch },
      { to: '/timeline', label: 'Linha do Tempo', icon: History },
    ],
  },
  {
    title: 'Configurações',
    items: [
      { to: '/profile', label: 'Perfil Pessoal', icon: User },
      { to: '/settings', label: 'Configurações', icon: Settings },
    ],
  },
];

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-100 flex items-center gap-1.5">
                ATLAS
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  OS
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Sistema Pessoal Inteligente</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {NAV_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.title}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? item.highlight
                            ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                            : 'bg-slate-800 text-brand-400 border border-slate-700/60 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs shrink-0">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Usuário'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sair da conta"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
