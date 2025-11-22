
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, WorkoutSession, LiftType, ProgressPhoto, BodyMetric } from '../types';
import { Settings as SettingsIcon, Edit2, Save, BarChart2, User as UserIcon, Scale, Plus, Award, Lock, Crown, Camera, Trash2, Maximize2, Medal } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';
import { PROGRAMS, ACHIEVEMENTS } from '../constants';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { TRANSLATIONS } from '../translations';

interface ProfileProps {
    profile: UserProfile;
    history: WorkoutSession[];
    onUpdateProfile: (p: UserProfile) => void;
    onOpenSettings: () => void;
}

// Image compression utility
const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const elem = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                elem.width = width;
                elem.height = height;
                const ctx = elem.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(ctx?.canvas.toDataURL(file.type, quality) || "");
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const ProfileView: React.FC<ProfileProps> = ({ profile, history, onUpdateProfile, onOpenSettings }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'body' | 'records' | 'awards'>('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [editMaxes, setEditMaxes] = useState(profile.trainingMaxes);
    const [selectedAnalyticsLift, setSelectedAnalyticsLift] = useState<LiftType>(LiftType.Squat);
    
    // Body Metrics State
    const [selectedMetric, setSelectedMetric] = useState<BodyMetric>('weight');
    const [metricInput, setMetricInput] = useState<string>('');
    const [comparePhotos, setComparePhotos] = useState<ProgressPhoto[]>([]);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = TRANSLATIONS[profile.language || 'en'];

    // Ensure measurements object exists (migration helper)
    const measurements = profile.measurements || {
        weight: profile.bodyWeightHistory?.map(b => ({ date: b.date, value: b.weight })) || [],
        chest: [],
        waist: [],
        arms: [],
        thighs: []
    };

    const currentMetricData = measurements[selectedMetric] || [];

    // --- Analytics Logic ---
    const getEst1RMData = () => {
        const relevantSessions = history.filter(s => 
            s.exercises.some(ex => ex.name === selectedAnalyticsLift && ex.type === 'Main')
        );

        return relevantSessions.map(s => {
            const mainExercise = s.exercises.find(ex => ex.name === selectedAnalyticsLift && ex.type === 'Main');
            if (!mainExercise) return null;

            let maxEst = 0;
            mainExercise.sets.forEach(set => {
                if (set.completed) {
                    const reps = set.actualReps || set.reps;
                    const weight = set.weight;
                    const est = weight * (1 + reps / 30);
                    if (est > maxEst) maxEst = est;
                }
            });

            return {
                date: s.date.split('/').slice(0,2).join('/'),
                est1RM: Math.round(maxEst),
            };
        }).filter(Boolean);
    };

    const getVolumeData = () => {
        const volumeByWeek: Record<string, number> = {};
        history.forEach(s => {
            const weekKey = `C${s.cycle}W${s.week}`;
            let vol = 0;
            s.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    if(set.completed) vol += (set.weight * (set.actualReps || set.reps));
                });
            });
            volumeByWeek[weekKey] = (volumeByWeek[weekKey] || 0) + vol;
        });

        return Object.entries(volumeByWeek).map(([week, vol]) => ({ week, volume: vol }));
    };

    // PR Logic
    const calculatePRs = (lift: LiftType) => {
        const records = {
            1: { weight: 0, date: '-' },
            3: { weight: 0, date: '-' },
            5: { weight: 0, date: '-' },
            10: { weight: 0, date: '-' }
        };

        history.forEach(session => {
            if (session.lift !== lift) return;
            session.exercises.forEach(ex => {
                if (ex.type === 'Main') {
                    ex.sets.forEach(set => {
                        if (set.completed) {
                            const reps = set.actualReps || set.reps;
                            const weight = set.weight;
                            
                            // Check 1RM
                            if (weight > records[1].weight) records[1] = { weight, date: session.date };
                            // Check 3RM
                            if (reps >= 3 && weight > records[3].weight) records[3] = { weight, date: session.date };
                            // Check 5RM
                            if (reps >= 5 && weight > records[5].weight) records[5] = { weight, date: session.date };
                             // Check 10RM
                            if (reps >= 10 && weight > records[10].weight) records[10] = { weight, date: session.date };
                        }
                    });
                }
            });
        });
        return records;
    };

    const getStrengthLevel = (lift: LiftType, weight: number, bw: number) => {
        if (!bw || bw === 0) return { level: 'Unknown', ratio: 0, progress: 0, nextTarget: 0, color: 'text-slate-500' };
        
        const ratios: Record<string, number[]> = {
            [LiftType.Squat]: [0.75, 1.0, 1.5, 2.0, 2.5],
            [LiftType.Bench]: [0.5, 0.75, 1.0, 1.5, 2.0],
            [LiftType.Deadlift]: [1.0, 1.25, 1.75, 2.25, 2.75],
            [LiftType.Overhead]: [0.35, 0.5, 0.7, 0.9, 1.15]
        };
        
        const ratio = weight / bw;
        const levels = ['Untrained', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Elite'];
        const standards = ratios[lift] || [0,0,0,0,0];
        
        let levelIndex = 0;
        while(levelIndex < 5 && ratio >= standards[levelIndex]) {
            levelIndex++;
        }
        
        const prev = levelIndex === 0 ? 0 : standards[levelIndex-1];
        const next = levelIndex === 5 ? standards[4] * 1.2 : standards[levelIndex];
        const percent = ((ratio - prev) / (next - prev)) * 100;
        
        return { 
            level: levels[levelIndex], 
            ratio: ratio.toFixed(2), 
            nextTarget: Math.round(next * bw), 
            progress: Math.min(100, Math.max(0, percent)),
            color: ['text-slate-500', 'text-green-400', 'text-blue-400', 'text-purple-400', 'text-amber-400', 'text-red-500'][levelIndex]
        };
    }

    const est1RMData = getEst1RMData();
    const volumeData = getVolumeData();
    const unlockedAchievements = profile.achievements || [];
    const progressPhotos = profile.progressPhotos || [];

    const handleSave = () => {
        onUpdateProfile({ ...profile, trainingMaxes: editMaxes });
        setIsEditing(false);
    };

    const handleAddMetric = () => {
        const val = parseFloat(metricInput);
        if (!val) return;
        
        const newEntry = {
            date: new Date().toLocaleDateString(),
            value: val
        };
        
        const currentList = measurements[selectedMetric] || [];
        const updatedList = [...currentList, newEntry];
        
        const updatedMeasurements = {
            ...measurements,
            [selectedMetric]: updatedList
        };
        
        const updates: Partial<UserProfile> = {
            measurements: updatedMeasurements
        };

        // Sync bodyWeight if that's what we're editing
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
                const newPhoto: ProgressPhoto = {
                    id: Date.now().toString(),
                    date: new Date().toLocaleDateString(),
                    dataUrl: compressedBase64,
                    notes: ''
                };
                onUpdateProfile({
                    ...profile,
                    progressPhotos: [newPhoto, ...progressPhotos]
                });
            } catch (err) {
                alert("Error processing image");
            }
        }
    };

    const handleDeletePhoto = (id: string) => {
        if (confirm("Delete this photo?")) {
            onUpdateProfile({
                ...profile,
                progressPhotos: progressPhotos.filter(p => p.id !== id)
            });
        }
    };

    const toggleCompare = (photo: ProgressPhoto) => {
        if (comparePhotos.find(p => p.id === photo.id)) {
            setComparePhotos(comparePhotos.filter(p => p.id !== photo.id));
        } else {
            if (comparePhotos.length < 2) {
                setComparePhotos([...comparePhotos, photo]);
            } else {
                // Replace second
                setComparePhotos([comparePhotos[0], photo]);
            }
        }
    };

    const renderAnalytics = () => {
        if (!profile.isPremium) {
            return (
                <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-slate-800 text-center p-6">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                        <Lock size={32} className="text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
                    <p className="text-slate-400 mb-6 max-w-xs">
                        Unlock detailed analytics, volume tracking, and strength standards to visualize your progress.
                    </p>
                    <Button onClick={onOpenSettings} className="bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold border-0">
                        View Upgrade Options
                    </Button>
                </div>
            );
        }

        const currentLiftMax = profile.oneRepMaxes[selectedAnalyticsLift];
        const strengthStats = getStrengthLevel(selectedAnalyticsLift, currentLiftMax, profile.bodyWeight);

        return (
            <div className="space-y-6 animate-in fade-in">
                <div className="flex overflow-x-auto space-x-2 pb-2">
                    {Object.values(LiftType).map(lift => (
                        <button
                            key={lift}
                            onClick={() => setSelectedAnalyticsLift(lift)}
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                                selectedAnalyticsLift === lift 
                                ? 'bg-theme text-white' 
                                : 'bg-slate-800 text-slate-400'
                            }`}
                        >
                            {lift}
                        </button>
                    ))}
                </div>

                <div className="bg-card p-4 rounded-xl border border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Strength Standards</h3>
                    <div className="flex justify-between items-end mb-2">
                        <span className={`text-2xl font-bold ${strengthStats.color}`}>{strengthStats.level}</span>
                        <span className="text-xs text-slate-500">Ratio: {strengthStats.ratio}x BW</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2 mb-2 overflow-hidden">
                        <div 
                            className={`h-full rounded-full ${strengthStats.color.replace('text', 'bg')}`} 
                            style={{ width: `${strengthStats.progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                        <span>{currentLiftMax} {profile.unit}</span>
                        <span>Next Level: {strengthStats.nextTarget} {profile.unit}</span>
                    </div>
                </div>

                <div className="bg-card p-4 rounded-xl border border-slate-800 h-64">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Estimated 1RM Trend</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={est1RMData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                itemStyle={{ color: '#3b82f6' }}
                            />
                            <Line type="monotone" dataKey="est1RM" stroke="var(--theme-primary)" strokeWidth={2} dot={{ r: 3, fill: 'var(--theme-primary)' }} activeDot={{ r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-card p-4 rounded-xl border border-slate-800 h-64">
                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Total Volume (Weekly)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volumeData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis dataKey="week" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip 
                                cursor={{fill: '#1e293b'}}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                            />
                            <Bar dataKey="volume" fill="var(--theme-secondary)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6">
             {/* Modal for Photo Comparison */}
             <Modal isOpen={comparePhotos.length > 0} onClose={() => setComparePhotos([])} title="Compare Progress">
                <div className="grid grid-cols-2 gap-4">
                    {comparePhotos.map((p, i) => (
                        <div key={i} className="space-y-2">
                            <div className="aspect-[3/4] bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
                                <img src={p.dataUrl} className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <div className="font-bold text-white">{p.date}</div>
                            </div>
                        </div>
                    ))}
                    {comparePhotos.length === 1 && (
                        <div className="aspect-[3/4] bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-xs text-center p-4">
                            Select another photo to compare
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <Button fullWidth variant="secondary" onClick={() => setComparePhotos([])}>Close</Button>
                </div>
             </Modal>

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full bg-theme flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-900/20 relative">
                        {profile.name.charAt(0)}
                        {profile.isPremium && (
                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black p-1 rounded-full border border-slate-900">
                                <Crown size={12} strokeWidth={3} />
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
                        <p className="text-xs text-slate-400">{profile.gender} • {profile.bodyWeight} {profile.unit}</p>
                    </div>
                </div>
                <button onClick={onOpenSettings} className="p-3 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors">
                    <SettingsIcon size={20} />
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-800">
                {[
                    { id: 'overview', icon: UserIcon, label: 'Overview' },
                    { id: 'analytics', icon: BarChart2, label: 'Analytics' },
                    { id: 'records', icon: Medal, label: 'Records' }, // Changed label
                    { id: 'body', icon: Scale, label: 'Body' },
                    { id: 'awards', icon: Award, label: 'Awards' },
                ].map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-all ${
                                isActive ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <tab.icon size={18} className="mb-1" />
                            <span className="text-[8px] font-bold uppercase tracking-wider">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            <div className="animate-in slide-in-from-bottom-4 duration-300">
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border border-slate-800 overflow-hidden">
                            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-white">Training Maxes</h3>
                                {isEditing ? (
                                    <button onClick={handleSave} className="text-green-400 hover:text-green-300">
                                        <Save size={20} />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="text-slate-400 hover:text-white">
                                        <Edit2 size={18} />
                                    </button>
                                )}
                            </div>
                            <div className="p-2">
                                {Object.values(LiftType).map((lift) => (
                                    <div key={lift} className="flex justify-between items-center p-3 border-b border-slate-800/50 last:border-0">
                                        <span className="text-slate-300">{lift}</span>
                                        <div className="flex items-center space-x-2">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    value={editMaxes[lift]}
                                                    onChange={(e) => setEditMaxes({ ...editMaxes, [lift]: parseInt(e.target.value) || 0 })}
                                                    className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-right text-white"
                                                />
                                            ) : (
                                                <span className="font-mono font-bold text-xl text-white">{profile.trainingMaxes[lift]}</span>
                                            )}
                                            <span className="text-xs text-slate-500 w-6">{profile.unit}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-slate-800">
                            <h3 className="font-bold text-white mb-2">Current Program</h3>
                            <div className="flex items-center justify-between bg-theme-soft p-3 rounded-lg border border-theme">
                                <div>
                                    <div className="text-theme font-bold">{PROGRAMS[profile.selectedProgram].name}</div>
                                    <div className="text-xs text-blue-300/70">{PROGRAMS[profile.selectedProgram].supplemental}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-slate-400">Cycle</div>
                                    <div className="text-xl font-bold text-white">{profile.currentCycle}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYTICS TAB */}
                {activeTab === 'analytics' && renderAnalytics()}

                {/* RECORDS TAB */}
                {activeTab === 'records' && (
                    <div className="space-y-4">
                        {Object.values(LiftType).map(lift => {
                            const prs = calculatePRs(lift);
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

                {/* BODY TAB */}
                {activeTab === 'body' && (
                    <div className="space-y-6">
                        <div className="bg-card p-4 rounded-xl border border-slate-800">
                            <h3 className="font-bold text-white mb-4">Log Measurements</h3>
                            
                            <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
                                {(['weight', 'chest', 'waist', 'arms', 'thighs'] as BodyMetric[]).map(metric => (
                                    <button
                                        key={metric}
                                        onClick={() => setSelectedMetric(metric)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all whitespace-nowrap ${
                                            selectedMetric === metric 
                                            ? 'bg-theme text-white shadow-lg' 
                                            : 'bg-slate-800 text-slate-500'
                                        }`}
                                    >
                                        {t[`metric_${metric}`] || metric}
                                    </button>
                                ))}
                            </div>

                            <div className="flex space-x-2">
                                <input 
                                    type="number" 
                                    value={metricInput}
                                    onChange={(e) => setMetricInput(e.target.value)}
                                    placeholder={`Value in ${profile.unit === 'kg' && selectedMetric !== 'weight' ? 'cm' : profile.unit}`}
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <Button onClick={handleAddMetric}>
                                    <Plus size={20} />
                                </Button>
                            </div>
                        </div>

                        <div className="bg-card p-4 rounded-xl border border-slate-800 h-64">
                            <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">
                                {t[`metric_${selectedMetric}`] || selectedMetric} History
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={currentMetricData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                                    <YAxis stroke="#475569" fontSize={10} domain={['auto', 'auto']} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#e2e8f0' }}
                                        itemStyle={{ color: '#10b981' }}
                                    />
                                    <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Progress Photos Section */}
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-white">Progress Photos</h3>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="bg-blue-600 text-white p-2 rounded-full shadow-lg shadow-blue-900/30 hover:bg-blue-500 transition-colors"
                                >
                                    <Camera size={20} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handlePhotoUpload} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {progressPhotos.map(photo => (
                                    <div key={photo.id} className="group relative aspect-[3/4] bg-slate-900 rounded-xl overflow-hidden border border-slate-800">
                                        <img src={photo.dataUrl} alt={photo.date} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2">
                                            <div className="text-xs font-bold text-white">{photo.date}</div>
                                        </div>
                                        
                                        {/* Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => toggleCompare(photo)}
                                                className={`p-2 rounded-full ${comparePhotos.find(p => p.id === photo.id) ? 'bg-blue-500 text-white' : 'bg-white/20 text-white hover:bg-blue-500'}`}
                                            >
                                                <Maximize2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeletePhoto(photo.id)}
                                                className="p-2 rounded-full bg-white/20 text-white hover:bg-red-500"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {progressPhotos.length === 0 && (
                                    <div className="col-span-2 py-8 text-center border border-dashed border-slate-700 rounded-xl bg-slate-900/20 text-slate-500">
                                        <Camera size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No photos yet.</p>
                                        <p className="text-xs mt-1">Take a photo to track visual progress.</p>
                                    </div>
                                )}
                            </div>
                            {comparePhotos.length > 0 && (
                                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold cursor-pointer z-50 animate-in slide-in-from-bottom-4" onClick={() => {/* Open modal handled by state */}}>
                                    Comparing {comparePhotos.length} Photo{comparePhotos.length > 1 ? 's' : ''}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* AWARDS TAB */}
                {activeTab === 'awards' && (
                    <div className="grid grid-cols-3 gap-3">
                        {ACHIEVEMENTS.map(ach => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);
                            return (
                                <div 
                                    key={ach.id} 
                                    className={`aspect-square flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                                        isUnlocked 
                                        ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 shadow-lg' 
                                        : 'bg-slate-900/50 border-slate-800 opacity-50 grayscale'
                                    }`}
                                >
                                    <div className="text-3xl mb-2">{ach.icon}</div>
                                    <div className="text-[10px] font-bold text-white leading-tight">{ach.name}</div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
