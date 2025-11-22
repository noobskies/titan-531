
import React, { useState, useRef } from 'react';
import { WorkoutSession, LiftType } from '../types';
import { FileText, Calendar as CalendarIcon, List, Trash2, Edit2, Share2, Clock, Dumbbell, Filter, Search, ImageIcon, Download, Activity, MapPin } from 'lucide-react';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import { TRANSLATIONS } from '../translations';

interface HistoryProps {
  history: WorkoutSession[];
  onDeleteSession: (id: string) => void;
  onUpdateSession: (session: WorkoutSession) => void;
}

export const HistoryView: React.FC<HistoryProps> = ({ history, onDeleteSession, onUpdateSession }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  
  // Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLift, setFilterLift] = useState<string>('All');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtering Logic
  const filteredHistory = history.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (session.notes && session.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLift = filterLift === 'All' || 
                          (session.type === 'Conditioning' && filterLift === 'Conditioning') ||
                          session.lift === filterLift;
      return matchesSearch && matchesLift;
  });

  // Group history by date for calendar
  const workoutsByDate = filteredHistory.reduce((acc, session) => {
    const dateStr = session.date; 
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this workout? This cannot be undone.")) {
          onDeleteSession(id);
          if (selectedSession?.id === id) setSelectedSession(null);
      }
  };

  const handleEditClick = (e: React.MouseEvent, session: WorkoutSession) => {
      e.stopPropagation();
      setEditingSession(session);
  };

  const handleSaveEdit = () => {
      if (editingSession) {
          onUpdateSession(editingSession);
          setEditingSession(null);
      }
  };

  const handleShareText = async () => {
      if (!selectedSession) return;
      
      const lines = [
          `🏋️ Titan 531 Log`,
          `${selectedSession.title} - ${selectedSession.date}`,
          `Duration: ${Math.floor(selectedSession.durationSeconds / 60)}m`,
          '',
      ];

      if (selectedSession.type === 'Conditioning' && selectedSession.conditioningData) {
           const cd = selectedSession.conditioningData;
           lines.push(`Activity: ${cd.activity}`);
           lines.push(`Intensity: ${cd.intensity}`);
           if (cd.distance) lines.push(`Distance: ${cd.distance} ${cd.distanceUnit}`);
      } else {
          selectedSession.exercises.forEach(ex => {
              if (ex.completed || ex.sets.some(s => s.completed)) {
                  lines.push(`▪️ ${ex.name}`);
                  ex.sets.forEach((set, i) => {
                      if (set.completed) {
                           lines.push(`   Set ${i+1}: ${set.weight} x ${set.actualReps || set.reps} ${set.isAmrap ? '(AMRAP)' : ''} ${set.rpe ? `@ RPE ${set.rpe}` : ''}`);
                      }
                  });
                  lines.push('');
              }
          });
      }

      if (selectedSession.notes) {
          lines.push(`📝 Notes: ${selectedSession.notes}`);
      }

      const text = lines.join('\n');
      
      try {
          await navigator.clipboard.writeText(text);
          alert("Summary copied to clipboard!");
      } catch (err) {
          console.error('Failed to copy: ', err);
      }
  };

  const handleShareImage = () => {
      // Simplified for brevity - mainly reusing existing logic but checking for type
      // For now, restrict complex image gen to Strength only or generic for cardio
      if (!selectedSession || !canvasRef.current) return;
      alert("Image generation is optimized for Strength workouts currently. Please use text share for Cardio.");
  };

  const renderCalendar = () => {
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
      return (
          <div className="bg-card p-4 rounded-xl border border-slate-800 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-medium">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <span className="text-xs text-slate-500">{filteredHistory.length} Sessions</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                  {['S','M','T','W','T','F','S'].map((d,i) => (
                      <div key={i} className="text-xs text-slate-600 font-bold mb-2">{d}</div>
                  ))}
                  {days.map(day => {
                      const dateString = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString();
                      const session = filteredHistory.find(s => s.date === dateString); // Just grab first
                      const hasWorkout = !!session;
                      const isCardio = session?.type === 'Conditioning';
                      
                      return (
                          <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${hasWorkout ? (isCardio ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-theme-soft text-theme font-bold border border-theme') : 'text-slate-600 bg-slate-900/30'}`}>
                              {day}
                              {hasWorkout && <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isCardio ? 'bg-green-500' : 'bg-theme'}`}></div>}
                          </div>
                      )
                  })}
              </div>
          </div>
      );
  }

  const renderList = () => (
      <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
        {filteredHistory.slice().reverse().map((session) => {
            const isCardio = session.type === 'Conditioning';
            return (
                <div 
                    key={session.id} 
                    onClick={() => setSelectedSession(session)}
                    className="bg-card p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all cursor-pointer active:scale-[0.99]"
                >
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <div className="flex items-center space-x-2">
                             <h3 className="font-bold text-white">{session.title}</h3>
                             {isCardio && <span className="text-[10px] bg-green-900/50 text-green-400 px-1.5 py-0.5 rounded border border-green-900">CARDIO</span>}
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                            <span>{session.date}</span>
                            {session.durationSeconds > 0 && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center"><Clock size={10} className="mr-1"/> {Math.floor(session.durationSeconds / 60)}m</span>
                                </>
                            )}
                            {isCardio && session.conditioningData?.distance && (
                                <>
                                    <span>•</span>
                                    <span className="flex items-center"><MapPin size={10} className="mr-1"/> {session.conditioningData.distance}{session.conditioningData.distanceUnit}</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => handleEditClick(e, session)} className="p-2 bg-slate-800 rounded text-blue-400 hover:text-white">
                            <Edit2 size={14} />
                        </button>
                        <button onClick={(e) => handleDelete(e, session.id)} className="p-2 bg-slate-800 rounded text-red-400 hover:text-white">
                            <Trash2 size={14} />
                        </button>
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
                                <span className={ex.completed ? 'text-green-400' : 'text-slate-600'}>
                                    {ex.sets.filter(s => s.completed).length}/{ex.sets.length}
                                </span>
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
        {filteredHistory.length === 0 && (
            <div className="text-center py-8 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                No workouts found matching your filters.
            </div>
        )}
      </div>
  )

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      {/* Hidden Canvas for Image Gen */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Search and Filters */}
      <div className="bg-card p-3 rounded-xl border border-slate-800 space-y-3">
          <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-500" />
              <input 
                  type="text" 
                  placeholder="Search history..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1">
              <div className="relative flex items-center bg-slate-900 rounded-lg px-2 border border-slate-800">
                 <Filter size={14} className="text-slate-500 mr-2" />
                 <select 
                    value={filterLift}
                    onChange={(e) => setFilterLift(e.target.value)}
                    className="bg-transparent text-xs font-bold text-white py-2 focus:outline-none appearance-none pr-4"
                 >
                     <option value="All">All Types</option>
                     <option value="Conditioning">Conditioning</option>
                     {Object.values(LiftType).map(l => <option key={l} value={l}>{l}</option>)}
                 </select>
              </div>
          </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editingSession} onClose={() => setEditingSession(null)} title="Edit Log">
          {editingSession && (
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm text-slate-400 mb-1">Notes</label>
                      <textarea 
                        value={editingSession.notes || ''}
                        onChange={(e) => setEditingSession({ ...editingSession, notes: e.target.value })}
                        className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                        placeholder="Workout notes..."
                      />
                  </div>
                  <div>
                      <label className="block text-sm text-slate-400 mb-1">Date</label>
                      <input 
                        type="text"
                        value={editingSession.date}
                        onChange={(e) => setEditingSession({ ...editingSession, date: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                  </div>
                  <div className="flex space-x-2 pt-2">
                      <Button fullWidth variant="secondary" onClick={() => setEditingSession(null)}>Cancel</Button>
                      <Button fullWidth onClick={handleSaveEdit}>Save Changes</Button>
                  </div>
              </div>
          )}
      </Modal>

      {/* Detail View Modal */}
      <Modal isOpen={!!selectedSession} onClose={() => setSelectedSession(null)} title="Workout Details">
         {selectedSession && (
             <div className="space-y-6">
                 <div className="flex justify-between items-start pb-4 border-b border-slate-800">
                     <div>
                         <h3 className="text-xl font-bold text-white">{selectedSession.title}</h3>
                         <div className="flex items-center space-x-2 text-sm text-slate-400 mt-1">
                             <CalendarIcon size={14} />
                             <span>{selectedSession.date}</span>
                         </div>
                     </div>
                     <div className="flex space-x-2">
                        <button 
                            onClick={handleShareText}
                            className="flex items-center space-x-2 bg-theme-soft text-theme px-3 py-1.5 rounded-lg hover:bg-theme hover:text-white transition-colors"
                        >
                            <Share2 size={16} />
                            <span className="text-xs font-bold">Share</span>
                        </button>
                     </div>
                 </div>

                 {/* Conditional Render based on Type */}
                 {selectedSession.type === 'Conditioning' && selectedSession.conditioningData ? (
                     <div className="space-y-4">
                         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                             <div>
                                 <div className="text-xs text-slate-500 uppercase">Activity</div>
                                 <div className="text-lg font-bold text-white">{selectedSession.conditioningData.activity}</div>
                             </div>
                             <div>
                                 <div className="text-xs text-slate-500 uppercase">Duration</div>
                                 <div className="text-lg font-bold text-white">{Math.floor(selectedSession.durationSeconds / 60)} min</div>
                             </div>
                             {selectedSession.conditioningData.distance && (
                                 <div>
                                     <div className="text-xs text-slate-500 uppercase">Distance</div>
                                     <div className="text-lg font-bold text-white">{selectedSession.conditioningData.distance} {selectedSession.conditioningData.distanceUnit}</div>
                                 </div>
                             )}
                             <div>
                                 <div className="text-xs text-slate-500 uppercase">Intensity</div>
                                 <div className="text-lg font-bold text-white">{selectedSession.conditioningData.intensity}</div>
                             </div>
                         </div>
                     </div>
                 ) : (
                     <div className="space-y-6">
                         {selectedSession.exercises.map((ex, i) => (
                             <div key={i} className="space-y-2">
                                 <div className="flex justify-between items-center">
                                     <div className="flex items-center space-x-2">
                                         <div className={`p-1.5 rounded-md ${ex.completed ? 'bg-green-900/20 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                                             <Dumbbell size={16} />
                                         </div>
                                         <span className="font-bold text-white">{ex.name}</span>
                                     </div>
                                     <span className="text-xs text-slate-500">{ex.type}</span>
                                 </div>
                                 <div className="grid grid-cols-4 gap-2 pl-8">
                                     {ex.sets.map((set, j) => (
                                         <div 
                                            key={j} 
                                            className={`text-xs text-center p-1.5 rounded border ${
                                                set.completed 
                                                ? 'bg-slate-800 border-slate-700 text-white' 
                                                : 'bg-slate-900 border-slate-800 text-slate-600'
                                            }`}
                                         >
                                             <div className="font-bold">{set.weight}</div>
                                             <div className="text-[10px] text-slate-400">x{set.actualReps || set.reps}</div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {selectedSession.notes && (
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 italic">
                         "{selectedSession.notes}"
                     </div>
                 )}

                 <div className="pt-2">
                     <Button fullWidth variant="secondary" onClick={() => setSelectedSession(null)}>Close</Button>
                 </div>
             </div>
         )}
      </Modal>

      <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Logs</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                  <CalendarIcon size={18} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}>
                  <List size={18} />
              </button>
          </div>
      </div>
      
      {viewMode === 'calendar' ? renderCalendar() : renderList()}
      
      {viewMode === 'calendar' && (
          <div className="mt-6">
              <h3 className="text-lg font-bold text-white mb-3">Recent Logs</h3>
              {renderList()}
          </div>
      )}
    </div>
  );
};
