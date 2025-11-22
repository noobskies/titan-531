
import React from 'react';
import { Activity, Calendar, User, MessageSquare, Dumbbell, Calculator, Users, Utensils } from 'lucide-react';
import { AppView } from '../types';
import { TRANSLATIONS } from '../translations';

interface LayoutProps {
  children: React.ReactNode;
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  isCoach?: boolean;
  isClientView?: boolean;
  onExitClientView?: () => void;
  language?: 'en' | 'es' | 'fr';
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  currentView, 
  onChangeView, 
  isCoach = false,
  isClientView = false,
  onExitClientView,
  language = 'en'
}) => {
  const t = TRANSLATIONS[language];

  const navItems = [
    { id: AppView.Dashboard, icon: Activity, label: t.nav_home },
    { id: AppView.Workout, icon: Dumbbell, label: t.nav_lift },
    { id: AppView.Nutrition, icon: Utensils, label: t.nav_nutrition },
    { id: AppView.Tools, icon: Calculator, label: t.nav_tools },
    { id: AppView.AICoach, icon: MessageSquare, label: t.nav_coach },
    { id: AppView.Profile, icon: User, label: t.nav_profile },
  ];

  // If in Coach mode, replace Profile or add Clients tab
  if (isCoach && !isClientView) {
     // Insert Client Dashboard item before Profile
     navItems.splice(5, 0, { id: AppView.CoachDashboard, icon: Users, label: t.nav_clients });
  }

  return (
    <div className="h-[100dvh] bg-darker text-slate-100 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-slate-900">
      {/* Client View Banner */}
      {isClientView && (
          <div className="bg-amber-600 px-4 py-1 text-xs font-bold text-black flex justify-between items-center z-50">
              <span>{t.coach_active_client}</span>
              <button 
                onClick={onExitClientView} 
                className="bg-black/20 hover:bg-black/40 px-2 py-0.5 rounded text-[10px] uppercase transition-colors"
              >
                  {t.coach_exit_client}
              </button>
          </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 overflow-y-auto pb-safe scrollbar-thin ${isClientView ? 'border-2 border-amber-600/30' : ''}`}>
        {/* Add substantial padding bottom to account for fixed nav and allow full scroll */}
        <div className="pb-40 min-h-full">
            {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-slate-800 px-1 py-2 pb-safe z-40">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-theme bg-theme-soft translate-y-[-2px]' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={{ minWidth: '16%' }}
              >
                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[9px] mt-1 font-medium truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
