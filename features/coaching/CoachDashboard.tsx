
import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { Button } from '../../components/Button';
import { Users, Plus, Activity, TrendingUp, Search } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { DEFAULT_TM, DEFAULT_ASSISTANCE, DEFAULT_TIMER_SETTINGS, DEFAULT_ASSISTANCE_SETTINGS } from '../../constants';
import { TRANSLATIONS } from '../../translations';

interface CoachDashboardProps {
    clients: UserProfile[];
    onAddClient: (client: UserProfile) => void;
    onSelectClient: (clientId: string) => void;
    language: 'en' | 'es' | 'fr';
}

export const CoachDashboard: React.FC<CoachDashboardProps> = ({ clients, onAddClient, onSelectClient, language }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    
    const t = TRANSLATIONS[language];

    const handleAdd = () => {
        if (!newClientName) return;
        
        const newClient: UserProfile = {
            id: `client-${Date.now()}`,
            name: newClientName,
            gender: 'Male',
            bodyWeight: 165,
            bodyWeightHistory: [],
            unit: 'lbs',
            rounding: 5,
            trainingMaxes: { ...DEFAULT_TM },
            oneRepMaxes: { ...DEFAULT_TM },
            currentCycle: 1,
            currentWeek: 1,
            selectedProgram: 'Original',
            progressionScheme: 'Standard',
            theme: 'dark',
            themeColor: 'blue',
            onboardingComplete: true, // Skip onboarding for added clients, assume coach configures
            defaultRestTimer: 120,
            timerSettings: DEFAULT_TIMER_SETTINGS,
            assistanceSettings: DEFAULT_ASSISTANCE_SETTINGS,
            customAssistance: DEFAULT_ASSISTANCE,
            achievements: [],
            isPremium: true, // Clients inherit pro features from coach
            soundEnabled: true,
            voiceEnabled: false,
            notificationsEnabled: false,
            isCoach: false,
            clients: [],
            language: language,
            customExercises: [],
            trainingDays: [1, 3, 5] // Default to Mon, Wed, Fri
        };

        onAddClient(newClient);
        setNewClientName('');
        setIsModalOpen(false);
    };

    const filteredClients = clients.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="p-4 space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{t.coach_dashboard_title}</h2>
                <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 p-2 rounded-lg text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-900/20">
                    <Plus size={20} />
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-3">
                <div className="bg-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <Users size={16} />
                        <span className="text-xs font-bold uppercase">Total Clients</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{clients.length}</div>
                </div>
                <div className="bg-card p-4 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2 text-slate-400 mb-1">
                        <Activity size={16} />
                        <span className="text-xs font-bold uppercase">Active Cycles</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{clients.reduce((acc, c) => acc + (c.currentCycle > 1 ? 1 : 0), 0)}</div>
                </div>
            </div>

            {/* Client List */}
            <div className="space-y-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search clients..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-3">
                    {filteredClients.length > 0 ? filteredClients.map(client => (
                        <div key={client.id} className="bg-card p-4 rounded-xl border border-slate-800 hover:border-slate-600 transition-all group">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{client.name}</h3>
                                        <p className="text-xs text-slate-400 flex items-center">
                                            {client.selectedProgram} • Cycle {client.currentCycle}
                                        </p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => onSelectClient(client.id)}>
                                    {t.coach_switch_view}
                                </Button>
                            </div>
                            
                            {/* Mini Stats */}
                            <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between text-xs text-slate-500">
                                <div className="flex items-center space-x-1">
                                    <TrendingUp size={12} />
                                    <span>Squat: {client.trainingMaxes.Squat}{client.unit}</span>
                                </div>
                                <div>
                                    Last Active: {new Date().toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-8 text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
                            <Users size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No clients found.</p>
                            <button onClick={() => setIsModalOpen(true)} className="text-blue-400 text-sm mt-2 hover:underline">Add your first client</button>
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t.coach_add_client}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Client Name</label>
                        <input 
                            type="text" 
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <Button fullWidth onClick={handleAdd} disabled={!newClientName}>
                        Create Profile
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
