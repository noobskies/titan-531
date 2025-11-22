
import React from 'react';
import { UserProfile, ThemeColor, LiftType, AppView } from '../../types';
import { THEME_COLORS, BAR_WEIGHT_KG, BAR_WEIGHT_LBS, ASSISTANCE_TEMPLATES } from '../../constants';
import { Palette, Globe, Calendar, Layout, Disc, Layers, Edit3, TrendingUp, Dumbbell } from 'lucide-react';
import { Button } from '../../components/Button';
import { TRANSLATIONS } from '../../translations';

interface SectionProps {
    profile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
    t: any;
}

export const AppearanceSection: React.FC<SectionProps> = ({ profile, onUpdateProfile, t }) => (
    <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center">
                <Palette size={16} className="mr-2 text-slate-400" /> Accent Color
            </label>
            <div className="flex justify-between gap-2">
                {(Object.keys(THEME_COLORS) as ThemeColor[]).map(color => (
                    <button
                        key={color}
                        onClick={() => onUpdateProfile({ ...profile, themeColor: color })}
                        className={`w-full h-10 rounded-lg border-2 transition-all ${
                            profile.themeColor === color 
                            ? 'border-white scale-110' 
                            : 'border-transparent hover:border-slate-600'
                        }`}
                        style={{ backgroundColor: THEME_COLORS[color].primary }}
                    />
                ))}
            </div>
        </div>
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                <Globe size={16} className="mr-2 text-slate-400" /> {t.settings_language}
            </label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                {['en', 'es', 'fr'].map((lang) => (
                    <button 
                        key={lang}
                        onClick={() => onUpdateProfile({ ...profile, language: lang as any })}
                        className={`flex-1 py-2 rounded text-sm font-medium uppercase transition-all ${profile.language === lang ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
                    >
                        {lang}
                    </button>
                ))}
            </div>
        </div>
    </div>
);

interface ScheduleSectionProps extends SectionProps {
    onOpenLiftOrder: () => void;
    onOpenInventory: () => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ profile, onUpdateProfile, onOpenLiftOrder, onOpenInventory, t }) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const toggleTrainingDay = (dayIndex: number) => {
        const currentDays = profile.trainingDays || [];
        let newDays;
        if (currentDays.includes(dayIndex)) {
            newDays = currentDays.filter(d => d !== dayIndex);
        } else {
            newDays = [...currentDays, dayIndex].sort();
        }
        onUpdateProfile({ ...profile, trainingDays: newDays });
    };

    return (
        <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center">
                    <Calendar size={16} className="mr-2 text-slate-400" /> Weekly Schedule
                </label>
                <div className="flex justify-between gap-1">
                    {daysOfWeek.map((day, idx) => {
                        const isSelected = (profile.trainingDays || []).includes(idx);
                        return (
                            <button
                                key={day}
                                onClick={() => toggleTrainingDay(idx)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                                    isSelected 
                                    ? 'text-white shadow-lg' 
                                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                                }`}
                                style={isSelected ? { backgroundColor: THEME_COLORS[profile.themeColor || 'blue'].primary } : {}}
                            >
                                {day.charAt(0)}
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Layout size={16} className="mr-2 text-slate-400" /> Main Lift Order
                </label>
                <Button variant="secondary" fullWidth onClick={onOpenLiftOrder}>Reorder Lifts</Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Disc size={16} className="mr-2 text-slate-400" /> Bar Weight
                </label>
                <div className="flex items-center space-x-3">
                    <input 
                        type="number" 
                        value={profile.customBarWeight || (profile.unit === 'kg' ? BAR_WEIGHT_KG : BAR_WEIGHT_LBS)}
                        onChange={(e) => onUpdateProfile({ ...profile, customBarWeight: parseFloat(e.target.value) })}
                        className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="text-sm text-slate-500">{profile.unit}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Layers size={16} className="mr-2 text-slate-400" /> {t.settings_inventory || 'Plate Inventory'}
                </label>
                <Button variant="secondary" fullWidth onClick={onOpenInventory}>Manage Plates</Button>
            </div>
        </div>
    );
};

interface ProgramSectionProps extends SectionProps {
    onOpenProgramEdit: () => void;
    onOpenWarmupEdit: () => void;
    onOpenAssistanceEdit: () => void;
    onManageExercises: () => void;
}

export const ProgramSection: React.FC<ProgramSectionProps> = ({ 
    profile, onUpdateProfile, t, 
    onOpenProgramEdit, onOpenWarmupEdit, onOpenAssistanceEdit, onManageExercises 
}) => {
    const applyAssistanceTemplate = (templateName: string) => {
        if (ASSISTANCE_TEMPLATES[templateName]) {
            onUpdateProfile({ ...profile, customAssistance: ASSISTANCE_TEMPLATES[templateName] });
            alert(`${templateName} template applied!`);
        }
    };

    const handleAssistanceSettingChange = (type: 'sets' | 'reps', val: number) => {
        const newSettings = { ...profile.assistanceSettings, [type]: val };
        onUpdateProfile({ ...profile, assistanceSettings: newSettings });
    };

    return (
        <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Edit3 size={16} className="mr-2 text-slate-400" /> {t.settings_program_custom}
                </label>
                <Button variant="secondary" fullWidth onClick={onOpenProgramEdit}>Customize Percentages & Reps</Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <TrendingUp size={16} className="mr-2 text-slate-400" /> Warmup Strategy
                </label>
                <Button variant="secondary" fullWidth onClick={onOpenWarmupEdit}>Customize Warmups</Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                        <Layout size={16} className="mr-2 text-slate-400" /> Assistance Work
                </label>
                <Button variant="secondary" fullWidth onClick={onOpenAssistanceEdit}>Customize Exercises</Button>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Quick Templates</label>
                <div className="grid grid-cols-2 gap-2">
                    {Object.keys(ASSISTANCE_TEMPLATES).map(template => (
                        <button
                            key={template}
                            onClick={() => applyAssistanceTemplate(template)}
                            className="text-xs p-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                        >
                            {template}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Assistance Volume</label>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Sets</label>
                        <input 
                            type="number" min="1" max="10"
                            value={profile.assistanceSettings?.sets || 3}
                            onChange={(e) => handleAssistanceSettingChange('sets', parseInt(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-slate-500 block mb-1">Reps</label>
                        <input 
                            type="number" min="1" max="50"
                            value={profile.assistanceSettings?.reps || 10}
                            onChange={(e) => handleAssistanceSettingChange('reps', parseInt(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                    <Dumbbell size={16} className="mr-2 text-slate-400" /> Custom Exercises
                </label>
                <Button variant="secondary" fullWidth onClick={onManageExercises}>Manage Exercises</Button>
            </div>
        </div>
    );
};
