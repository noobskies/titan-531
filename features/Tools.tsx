
import React, { useState } from 'react';
import { Video, MapPin } from 'lucide-react';
import { PlateCalculator } from './PlateCalculator';
import { OneRepMaxCalc } from './OneRepMaxCalc';
import { IntervalTimer } from './IntervalTimer';
import { WarmupGenerator } from './WarmupGenerator';
import { FormCheck } from './FormCheck';
import { CycleManager } from './CycleManager';
import { GymFinder } from './GymFinder';
import { TRANSLATIONS } from '../translations';
import { UserProfile } from '../types';

// Fix props interface
interface ToolsProps {
    profile?: UserProfile; // Make optional to avoid breaking existing calls immediately, but logic requires it
    onUpdateProfile?: (p: UserProfile) => void;
    language?: 'en' | 'es' | 'fr';
}

export const ToolsView: React.FC<ToolsProps> = ({ profile, onUpdateProfile, language = 'en' }) => {
  const [activeTab, setActiveTab] = useState<'plates' | '1rm' | 'timer' | 'warmup' | 'formcheck' | 'cycle' | 'gyms'>('plates');
  const t = TRANSLATIONS[language];

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{t.nav_tools}</h2>
      </div>

      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 overflow-x-auto scrollbar-hide">
        <button
            onClick={() => setActiveTab('plates')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'plates' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {t.tools_plate_calc}
        </button>
        <button
            onClick={() => setActiveTab('cycle')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'cycle' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {t.tools_cycle_mgr}
        </button>
        <button
            onClick={() => setActiveTab('warmup')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'warmup' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {t.tools_warmup}
        </button>
        <button
            onClick={() => setActiveTab('1rm')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === '1rm' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {t.tools_1rm_calc}
        </button>
        <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'timer' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            {t.tools_intervals}
        </button>
        <button
            onClick={() => setActiveTab('formcheck')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center space-x-1 ${activeTab === 'formcheck' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            <Video size={12} className="mr-1" />
            <span>Form</span>
        </button>
        <button
            onClick={() => setActiveTab('gyms')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center justify-center space-x-1 ${activeTab === 'gyms' ? 'bg-theme text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
        >
            <MapPin size={12} className="mr-1" />
            <span>Gyms</span>
        </button>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
        {activeTab === 'plates' && <PlateCalculator />}
        {activeTab === 'warmup' && <WarmupGenerator />}
        {activeTab === '1rm' && <OneRepMaxCalc />}
        {activeTab === 'timer' && <IntervalTimer />}
        {activeTab === 'formcheck' && <FormCheck />}
        {activeTab === 'gyms' && <GymFinder />}
        {activeTab === 'cycle' && (
            profile && onUpdateProfile ? (
                <CycleManager profile={profile} onUpdateProfile={onUpdateProfile} />
            ) : (
                <div className="text-center text-slate-500 p-4">Profile data not available.</div>
            )
        )}
      </div>
    </div>
  );
};
