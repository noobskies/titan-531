
import React, { useState, useRef } from 'react';
import { UserProfile, WorkoutSession, LiftType, ProgressPhoto, BodyMetric } from '../../types';
import { Settings as SettingsIcon, Edit2, Save, BarChart2, User as UserIcon, Scale, Plus, Award, Lock, Crown, Camera, Trash2, Maximize2, Medal } from 'lucide-react';
import { PROGRAMS, ACHIEVEMENTS } from '../../constants';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TRANSLATIONS } from '../../translations';
import { getStrengthLevel, prepareEst1RMData, prepareVolumeData, calculatePRs } from '../../services/analytics/analyticsLogic';
import { TrendChart, VolumeBarChart } from '../../components/AnalyticsCharts';
import { compressImage } from '../../utils/imageUtils';

interface ProfileProps {
    profile: UserProfile;
    history: WorkoutSession[];
    onUpdateProfile: (p: UserProfile) => void;
    onOpenSettings: () => void;
}

export const ProfileView: React.FC<ProfileProps> = ({ profile, history, onUpdateProfile, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'body' | 'records' | 'awards'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editMaxes, setEditMaxes] = useState(profile.trainingMaxes);
    const [selectedAnalyticsLift, setSelectedAnalyticsLift] = useState<LiftType>(LiftType.Squat);
    const [selectedMetric, setSelectedMetric] = useState<BodyMetric>('weight');
    const [metricInput, setMetricInput] = useState<string>('');
    const [comparePhotos, setComparePhotos] = useState<ProgressPhoto[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = TRANSLATIONS[profile.language || 'en'];

    const measurements = profile.measurements || {
        weight: profile.bodyWeightHistory?.map(b => ({ date: b.date, value: b.weight })) || [],
        chest: [],
        waist: [],
        arms: [],
        thighs: []
    };

    const currentMetricData = measurements[selectedMetric] || [];
    const unlockedAchievements = profile.achievements || [];
    const progressPhotos = profile.progressPhotos || [];

    const handleSave = () => {
        onUpdateProfile({ ...profile, trainingMaxes: editMaxes });
        setIsEditing(false);
    };

    const handleAddMetric = () => {
        const val = parseFloat(metricInput);
        if (!val) return;
        const newEntry = { date: new Date().toLocaleDateString(), value: val };
        const updatedList = [...(measurements[selectedMetric] || []), newEntry];
        const updates: Partial<UserProfile> = { measurements: { ...measurements, [selectedMetric]: updatedList } };
        if (selectedMetric === 'weight') {
            updates.bodyWeight = val;
            updates.bodyWeightHistory = updatedList.map(m => ({ date: m.date, weight: m.value }));
        }
        onUpdateProfile({ ...profile, ...updates });
        setMetricInput('');
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const compressedBase64 = await compressImage(e.target.files[0]);
                const newPhoto: ProgressPhoto = { id: Date.now().toString(), date: new Date().toLocaleDateString(), dataUrl: compressedBase64, notes: '' };
                onUpdateProfile({ ...profile, progressPhotos: [newPhoto, ...progressPhotos] });
            } catch (err) { alert("Error processing image"); }
        }
    };

    const renderAnalytics = () => {
        if (!profile.isPremium) {
            return (
                <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-slate-800 text-center p-6">
                    <div className="bg-slate-800 p-4 rounded-full mb-4"><Lock size={32} className="text-slate-400" /></div>
                    <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
                    <p className="text-slate-400 mb-6 max-w-xs">Unlock detailed analytics and strength standards.</p>
                    <Button onClick={onOpenSettings} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold border-0">View Upgrade Options</Button>
                </div>
            );
        }

        const currentLiftMax = profile.oneRepMaxes[selectedAnalyticsLift];
        const strengthStats = getStrengthLevel(selectedAnalyticsLift, currentLiftMax, profile.bodyWeight);
        const est1RMData = prepareEst1RMData(history, selectedAnalyticsLift);
        const volumeData = prepareVolumeData(history);

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex overflow-x-auto space-x-2 pb-2">
                    {Object.values(LiftType).map(lift => (
                        <button key={lift} onClick={() => setSelectedAnalyticsLift(lift)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedAnalyticsLift === lift ? 'bg-theme text-white' : 'bg-slate-800 text-slate-400'}`}>{lift}</button>
                    ))}
                </div>

                <div className="bg-card p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Strength Standards</h3>
                    <div className="flex justify-between items-end mb-2">
                        <span className={`text-2xl font-bold ${strengthStats.color}`}>{strengthStats.level}</span>
                        <span className="text-xs text-slate-500">Ratio: {strengthStats.ratio}x BW</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden">
                        <div className={`h-full rounded-full ${strengthStats.color.replace('text', 'bg')}`} style={{ width: `${strengthStats.progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{currentLiftMax} {profile.unit}</span>
                        <span>Next Level: {strengthStats.nextTarget} {profile.unit}</span>
                    </div>
                </div>

                <TrendChart data={est1RMData} dataKey="est1RM" color="var(--theme-primary)" title="Est. 1RM Trend" unit={profile.unit} />
                <VolumeBarChart data={volumeData} dataKey="volume" color="var(--theme-secondary)" title="Weekly Volume" />
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6">
             <Modal isOpen={comparePhotos.length > 0} onClose={() => setComparePhotos([])} title="Compare Progress">
                <div className="grid grid-cols-2 gap-4">
                    {comparePhotos.map((p, i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                                <img src={p.dataUrl} className="w-full h-full object-cover" alt="Progress" />
                            </div>
                            <div className="text-center font-bold text-white">{p.date}</div>
                        </div>
                    ))}
                </div>
                <Button fullWidth variant="secondary" onClick={() => setComparePhotos([])} className="mt-4">Close</Button>
             </Modal>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-theme flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/20 relative">
                        {profile.name.charAt(0)}
                        {profile.isPremium && <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full border border-slate-900"><Crown size={12} strokeWidth={3} /></div>}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                        <p className="text-xs text-slate-400">{profile.gender} • {profile.bodyWeight} {profile.unit}</p>
                    </div>
                </div>
                <button onClick={onOpenSettings} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"><SettingsIcon size={20} /></button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                {[
                    { id: 'overview', icon: UserIcon, label: 'Overview' },
                    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
                    { id: 'records', icon: Medal, label: 'Records' },
                    { id: 'body', icon: Scale, label: 'Body' },
                    { id: 'awards', icon: Award, label: 'Awards' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>
                        <tab.icon size={18} className="mb-1" />
                        <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="animate-in slide-in-from-bottom-4 duration-300">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-white">Training Maxes</h3>
                                {isEditing ? <button onClick={handleSave} className="text-green-400"><Save size={20} /></button> : <button onClick={() => setIsEditing(true)} className="text-slate-400"><Edit2 size={18} /></button>}
                            </div>
                            <div className="p-2">
                                {Object.values(LiftType).map((lift) => (
                                    <div key={lift} className="flex justify-between items-center p-3 border-b border-slate-800/50 last:border-0">
                                        <span className="text-slate-300">{lift}</span>
                                        <div className="flex items-center space-x-2">
                                            {isEditing ? <input type="number" value={editMaxes[lift]} onChange={(e) => setEditMaxes({ ...editMaxes, [lift]: parseInt(e.target.value) || 0 })} className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white" /> : <span className="font-mono font-bold text-xl text-white">{profile.trainingMaxes[lift]}</span>}
                                            <span className="text-xs text-slate-500 w-6">{profile.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-slate-800">
                            <h3 className="font-bold text-white mb-2">Current Program</h3>
                            <div className="flex items-center justify-between bg-theme-soft p-3 rounded-lg border border-theme">
                                <div><div className="text-theme font-bold">{PROGRAMS[profile.selectedProgram].name}</div><div className="text-xs text-blue-300/70">{PROGRAMS[profile.selectedProgram].supplemental}</div></div>
                                <div className="text-right"><div className="text-xs text-slate-400">Cycle</div><div className="text-xl font-bold text-white">{profile.currentCycle}</div></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && renderAnalytics()}

                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {Object.values(LiftType).map(lift => {
                            const prs = calculatePRs(history, lift);
                            return (
                                <div key={lift} className="bg-card rounded-xl border border-slate-800 overflow-hidden">
                                    <div className="bg-slate-900/50 px-4 py-2 border-b border-slate-800 flex justify-between items-center">
                                        <h3 className="font-bold text-white">{lift}</h3>
                                        <div className="text-xs text-slate-500">All Time Bests</div>
                                    </div>
                                    <div className="grid grid-cols-4 divide-x divide-slate-800">
                                        {[1, 3, 5, 10].map(rep => (
                                            <div key={rep} className="p-3 text-center">
                                                <div className="text-xs text-slate-500 font-bold mb-1">{rep}RM</div>
                                                <div className="text-lg font-bold text-white">{prs[rep as 1|3|5|10].weight > 0 ? prs[rep as 1|3|5|10].weight : '-'}</div>
                                                <div className="text-[9px] text-slate-600">{prs[rep as 1|3|5|10].date}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {activeTab === 'body' && (
                    <div className="space-y-6">
                        <div className="bg-card p-4 rounded-xl border border-slate-800">
                            <h3 className="font-bold text-white mb-4">Log Measurements</h3>
                            <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
                                {(['weight', 'chest', 'waist', 'arms', 'thighs'] as BodyMetric[]).map(metric => (
                                    <button key={metric} onClick={() => setSelectedMetric(metric)} className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${selectedMetric === metric ? 'bg-theme text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>{t[`metric_${metric}`] || metric}</button>
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <input type="number" value={metricInput} onChange={(e) => setMetricInput(e.target.value)} placeholder="Value" className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <Button onClick={handleAddMetric}><Plus size={20} /></Button>
                            </div>
                        </div>
                        <TrendChart data={currentMetricData} dataKey="value" color="#10b981" title={`${t[`metric_${selectedMetric}`] || selectedMetric} History`} />
                        
                        <div>
                             <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">Progress Photos</h3>
                                <button onClick={() => fileInputRef.current?.click()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-500"><Camera size={20} /></button>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {progressPhotos.map(photo => (
                                    <div key={photo.id} className="group relative aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                        <img src={photo.dataUrl} alt={photo.date} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2"><div className="text-xs font-bold text-white">{photo.date}</div></div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                            <button onClick={() => {
                                                if (comparePhotos.find(p => p.id === photo.id)) setComparePhotos(comparePhotos.filter(p => p.id !== photo.id));
                                                else setComparePhotos([...comparePhotos.slice(-1), photo]);
                                            }} className="p-2 rounded-full bg-white/20 text-white hover:bg-blue-500"><Maximize2 size={16} /></button>
                                            <button onClick={() => { if(confirm("Delete?")) onUpdateProfile({...profile, progressPhotos: progressPhotos.filter(p => p.id !== photo.id)}) }} className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'awards' && (
                    <div className="grid grid-cols-3 gap-3">
                        {ACHIEVEMENTS.map(ach => (
                            <div key={ach.id} className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl border text-center ${unlockedAchievements.includes(ach.id) ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg' : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'}`}>
                                <div className="text-3xl mb-2">{ach.icon}</div>
                                <div className="text-[10px] font-bold text-white leading-tight">{ach.name}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
