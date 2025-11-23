
import React from 'react';
import { WorkoutSession } from '../../types';
import { Edit2, Trash2, Clock, MapPin, FileText } from 'lucide-react';

interface HistoryListProps {
    history: WorkoutSession[];
    onEdit: (session: WorkoutSession) => void;
    onDelete: (id: string) => void;
    onSelect: (session: WorkoutSession) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ history, onEdit, onDelete, onSelect }) => {
    if (history.length === 0) {
        return <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">No workouts found matching your filters.</div>;
    }

    return (
        <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
            {history.slice().reverse().map((session) => {
                const isCardio = session.type === 'Conditioning';
                return (
                    <div key={session.id} onClick={() => onSelect(session)} className="bg-card p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all cursor-pointer active:scale-[0.99]">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex items-center space-x-2">
                                    <h3 className="font-bold text-white">{session.title}</h3>
                                    {isCardio && <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded border border-green-900">CARDIO</span>}
                                </div>
                                <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                                    <span>{session.date}</span>
                                    {session.durationSeconds > 0 && <span className="flex items-center"><Clock size={10} className="mr-1"/> {Math.floor(session.durationSeconds / 60)}m</span>}
                                    {isCardio && session.conditioningData?.distance && <span className="flex items-center"><MapPin size={10} className="mr-1"/> {session.conditioningData.distance}{session.conditioningData.distanceUnit}</span>}
                                </div>
                            </div>
                            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); onEdit(session); }} className="p-2 bg-slate-800 rounded text-blue-400 hover:text-white"><Edit2 size={14} /></button>
                                <button onClick={(e) => { e.stopPropagation(); onDelete(session.id); }} className="p-2 bg-slate-800 rounded text-red-400 hover:text-white"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        
                        {isCardio ? (
                            <div className="text-sm text-slate-400 mb-3">
                                {session.conditioningData?.activity} - Intensity: <span className={session.conditioningData?.intensity === 'Hard' ? 'text-red-400' : 'text-slate-300'}>{session.conditioningData?.intensity}</span>
                            </div>
                        ) : (
                            <div className="space-y-1 mb-3">
                                {session.exercises.slice(0, 3).map(ex => (
                                    <div key={ex.id} className="flex justify-between text-sm text-slate-400">
                                        <span>{ex.name}</span>
                                        <span className={ex.completed ? 'text-green-400' : 'text-slate-600'}>{ex.sets.filter(s => s.completed).length}/{ex.sets.length}</span>
                                    </div>
                                ))}
                                {session.exercises.length > 3 && <div className="text-xs text-slate-600 italic">+ {session.exercises.length - 3} more</div>}
                            </div>
                        )}
                        
                        {session.notes && (
                            <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50 flex items-start gap-2">
                                <FileText size={14} className="shrink-0 mt-0.5 opacity-50" />
                                <span className="italic truncate w-full">"{session.notes}"</span>
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    );
};
