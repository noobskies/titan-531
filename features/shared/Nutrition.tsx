
import React, { useState, useRef } from 'react';
import { UserProfile, Meal, NutritionTargets } from '../../types';
import { Button } from '../../components/Button';
import { analyzeNutrition } from '../../services/api/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Camera, Plus, Loader, Trash2, Utensils, Target, WifiOff } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { useUI } from '../../context/UIContext';

interface NutritionProps {
    profile: UserProfile;
    onUpdateProfile: (p: UserProfile) => void;
}

export const Nutrition: React.FC<NutritionProps> = ({ profile, onUpdateProfile }) => {
    const { isOffline } = useUI();
    const [loading, setLoading] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Default targets if not set
    const targets = profile.nutritionTargets || { calories: 2500, protein: 180, carbs: 250, fats: 80 };
    const today = new Date().toLocaleDateString();
    const log = profile.nutritionLog || {};
    const todaysMeals = log[today] || [];

    // Calculate totals
    const totals = todaysMeals.reduce((acc, meal) => ({
        calories: acc.calories + meal.macros.calories,
        protein: acc.protein + meal.macros.protein,
        carbs: acc.carbs + meal.macros.carbs,
        fats: acc.fats + meal.macros.fats
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const handleAnalyzeText = async () => {
        if (!textInput.trim() || isOffline) return;
        setLoading(true);
        try {
            const result = await analyzeNutrition(textInput);
            if (result) {
                addMeal(result);
                setTextInput('');
            }
        } catch (e) {
            alert("Could not analyze food.");
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && !isOffline) {
            const file = e.target.files[0];
            setLoading(true);
            
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = (reader.result as string).split(',')[1];
                try {
                    const result = await analyzeNutrition({ data: base64Data, mimeType: file.type });
                    if (result) {
                        addMeal(result, reader.result as string); 
                    }
                } catch (err) {
                    alert("Error processing image.");
                } finally {
                    setLoading(false);
                }
            };
        }
    };

    const addMeal = (data: { name: string, calories: number, protein: number, carbs: number, fats: number }, photoUrl?: string) => {
        const newMeal: Meal = {
            id: Date.now().toString(),
            name: data.name,
            timestamp: Date.now(),
            macros: {
                calories: Math.round(data.calories),
                protein: Math.round(data.protein),
                carbs: Math.round(data.carbs),
                fats: Math.round(data.fats)
            },
            photoUrl
        };

        const updatedLog = {
            ...log,
            [today]: [...todaysMeals, newMeal]
        };

        onUpdateProfile({ ...profile, nutritionLog: updatedLog });
    };

    const deleteMeal = (id: string) => {
        const updatedLog = {
            ...log,
            [today]: todaysMeals.filter(m => m.id !== id)
        };
        onUpdateProfile({ ...profile, nutritionLog: updatedLog });
    };

    const calculateTargets = (goal: 'lose' | 'maintain' | 'gain') => {
        const weightKg = profile.unit === 'lbs' ? profile.bodyWeight * 0.453592 : profile.bodyWeight;
        const tdee = weightKg * 24 * 1.4; 
        
        let cals = tdee;
        if (goal === 'lose') cals -= 500;
        if (goal === 'gain') cals += 300;

        const protein = Math.round(weightKg * 2.2); 
        const remainingCals = cals - (protein * 4);
        const fats = Math.round((remainingCals * 0.35) / 9);
        const carbs = Math.round((remainingCals * 0.65) / 4);

        onUpdateProfile({
            ...profile,
            nutritionTargets: {
                calories: Math.round(cals),
                protein,
                carbs,
                fats
            }
        });
        setIsModalOpen(false);
    };

    const renderProgressBar = (label: string, current: number, target: number, color: string) => {
        const pct = Math.min(100, (current / target) * 100);
        return (
            <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400 font-bold">{label}</span>
                    <span className="text-white">{current} / {target}g</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }}></div>
                </div>
            </div>
        );
    };

    const pieData = [
        { name: 'Protein', value: totals.protein * 4, color: '#3b82f6' },
        { name: 'Carbs', value: totals.carbs * 4, color: '#10b981' },
        { name: 'Fats', value: totals.fats * 9, color: '#f59e0b' },
    ];
    if (totals.calories === 0) pieData.push({ name: 'Empty', value: 1, color: '#1e293b' });

    return (
        <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Nutrition</h2>
                        <p className="text-xs text-slate-400">AI-Powered Tracking</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white border border-slate-700"
                    >
                        <Target size={20} />
                    </button>
                </div>

                {/* Summary Card */}
                <div className="bg-card rounded-xl border border-slate-800 p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-3xl font-bold text-white">{totals.calories}</div>
                            <div className="text-xs text-slate-500">of {targets.calories} kcal</div>
                        </div>
                        <div className="w-16 h-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie 
                                        data={pieData} 
                                        innerRadius={20} 
                                        outerRadius={30} 
                                        paddingAngle={5} 
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {renderProgressBar('Protein', totals.protein, targets.protein, 'bg-blue-500')}
                    {renderProgressBar('Carbs', totals.carbs, targets.carbs, 'bg-green-500')}
                    {renderProgressBar('Fats', totals.fats, targets.fats, 'bg-amber-500')}
                </div>

                {/* Input Area */}
                <div className="space-y-3">
                     <h3 className="text-sm font-bold text-slate-500 uppercase">Log Meal</h3>
                     <div className="flex gap-2">
                         <div className="relative flex-1">
                            <input 
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder={isOffline ? "Offline" : "e.g. 2 eggs and toast"}
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeText()}
                                disabled={isOffline}
                            />
                            <button 
                                onClick={handleAnalyzeText}
                                disabled={loading || !textInput || isOffline}
                                className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-lg text-white disabled:opacity-50"
                            >
                                {loading ? <Loader size={14} className="animate-spin"/> : isOffline ? <WifiOff size={14} /> : <Plus size={14} />}
                            </button>
                         </div>
                         <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isOffline}
                            className="bg-slate-800 border border-slate-700 rounded-xl w-12 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                             <Camera size={20} />
                         </button>
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            className="hidden" 
                            accept="image/*" 
                            disabled={isOffline}
                        />
                     </div>
                </div>

                {/* Meal List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-slate-500 uppercase">Today's Log</h3>
                    {todaysMeals.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 text-sm">
                            No meals logged today.
                        </div>
                    )}
                    {todaysMeals.slice().reverse().map(meal => (
                        <div key={meal.id} className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                             <div className="flex items-center space-x-3">
                                 {meal.photoUrl ? (
                                     <img src={meal.photoUrl} alt={meal.name} className="w-10 h-10 rounded-lg object-cover bg-slate-800" />
                                 ) : (
                                     <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                         <Utensils size={16} className="text-slate-500" />
                                     </div>
                                 )}
                                 <div>
                                     <div className="font-bold text-white text-sm">{meal.name}</div>
                                     <div className="text-xs text-slate-500">
                                         {meal.macros.calories} kcal • {meal.macros.protein}g P • {meal.macros.carbs}g C • {meal.macros.fats}g F
                                     </div>
                                 </div>
                             </div>
                             <button onClick={() => deleteMeal(meal.id)} className="text-slate-600 hover:text-red-500 p-2">
                                 <Trash2 size={16} />
                             </button>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Calorie Calculator">
                <div className="space-y-4">
                    <p className="text-sm text-slate-400">Automatically calculate macro targets based on your profile weight ({profile.bodyWeight} {profile.unit}).</p>
                    
                    <button onClick={() => calculateTargets('lose')} className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 text-left transition-all">
                        <div className="font-bold text-white">Cut (Weight Loss)</div>
                        <div className="text-xs text-slate-500">Deficit ~500 kcal</div>
                    </button>
                    <button onClick={() => calculateTargets('maintain')} className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 text-left transition-all">
                        <div className="font-bold text-white">Maintain</div>
                        <div className="text-xs text-slate-500">Estimated TDEE</div>
                    </button>
                    <button onClick={() => calculateTargets('gain')} className="w-full p-4 bg-slate-800 rounded-xl border border-slate-700 hover:border-blue-500 text-left transition-all">
                        <div className="font-bold text-white">Bulk (Muscle Gain)</div>
                        <div className="text-xs text-slate-500">Surplus ~300 kcal</div>
                    </button>
                </div>
            </Modal>
        </div>
    );
};
