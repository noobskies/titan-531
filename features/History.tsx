
import React, { useState, useRef } from 'react';
import { WorkoutSession, LiftType } from '../types';
import { FileText, Calendar as CalendarIcon, List, Trash2, Edit2, Share2, Clock, Dumbbell, Filter, Search, ImageIcon, Download } from 'lucide-react';
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
  const [filterLift, setFilterLift] = useState<LiftType | 'All'>('All');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Filtering Logic
  const filteredHistory = history.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (session.notes && session.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLift = filterLift === 'All' || session.lift === filterLift;
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
          `🏋️ Titan 531 Workout Log`,
          `${selectedSession.title} - ${selectedSession.date}`,
          `Duration: ${Math.floor(selectedSession.durationSeconds / 60)}m`,
          '',
      ];

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

      if (selectedSession.notes) {
          lines.push(`📝 Notes: ${selectedSession.notes}`);
      }

      const text = lines.join('\n');
      
      try {
          await navigator.clipboard.writeText(text);
          alert("Workout summary copied to clipboard!");
      } catch (err) {
          console.error('Failed to copy: ', err);
      }
  };

  const handleShareImage = () => {
      if (!selectedSession || !canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Canvas Config
      const width = 600;
      const height = 800;
      canvas.width = width;
      canvas.height = height;

      // Background - Dark Blue Gradient
      const grd = ctx.createLinearGradient(0, 0, 0, height);
      grd.addColorStop(0, '#0f172a');
      grd.addColorStop(1, '#1e293b');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, width, height);

      // Header Area
      ctx.fillStyle = '#3b82f6'; // Theme color
      ctx.fillRect(0, 0, width, 100);

      // Title
      ctx.fillStyle = 'white';
      ctx.font = 'bold 36px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(selectedSession.lift.toUpperCase(), width / 2, 60);
      
      ctx.font = '18px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(selectedSession.date, width / 2, 85);

      // Stats Row
      const duration = Math.floor(selectedSession.durationSeconds / 60);
      const totalVol = selectedSession.exercises.reduce((acc, ex) => acc + ex.sets.reduce((sAcc, s) => sAcc + (s.completed ? s.weight * (s.actualReps||s.reps) : 0), 0), 0);
      
      ctx.fillStyle = '#334155';
      ctx.fillRect(40, 120, width - 80, 60);
      
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText("DURATION", 60, 145);
      ctx.fillText("VOLUME", width - 140, 145);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.fillText(`${duration} min`, 60, 168);
      ctx.fillText(`${totalVol} lbs`, width - 140, 168);

      // Exercises List
      let y = 220;
      ctx.textAlign = 'left';
      
      selectedSession.exercises.forEach(ex => {
          if (y > height - 100) return; // Cutoff
          if (!ex.completed && !ex.sets.some(s => s.completed)) return;

          // Exercise Name
          ctx.fillStyle = '#60a5fa';
          ctx.font = 'bold 22px Inter, sans-serif';
          ctx.fillText(ex.name, 40, y);
          y += 30;

          // Sets
          ctx.fillStyle = '#e2e8f0';
          ctx.font = '18px Inter, sans-serif';
          let setStr = "";
          
          // Simplified display for image: "135x5, 185x5, 225x10"
          const sets = ex.sets.filter(s => s.completed).map(s => `${s.weight}x${s.actualReps||s.reps}`).join(', ');
          
          // Wrap text if needed (basic)
          if (sets.length > 50) {
              ctx.fillText(sets.substring(0, 50) + "...", 40, y);
          } else {
              ctx.fillText(sets, 40, y);
          }
          
          y += 40;
          
          // Divider
          ctx.beginPath();
          ctx.strokeStyle = '#334155';
          ctx.moveTo(40, y - 10);
          ctx.lineTo(width - 40, y - 10);
          ctx.stroke();
          y += 20;
      });

      // Footer
      ctx.fillStyle = 'rgba(255,255,255,0.1)';
      ctx.fillRect(0, height - 60, width, 60);
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'italic 16px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText("Titan 531 Tracker", width / 2, height - 25);

      // Convert to image and download
      try {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `titan-workout-${selectedSession.date.replace(/\//g, '-')}.png`;
          link.href = dataUrl;
          link.click();
      } catch (e) {
          alert("Could not generate image.");
      }
  };

  const renderCalendar = () => {
      const today = new Date();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      
      return (
          <div className="bg-card p-4 rounded-xl border border-slate-800 animate-in fade-in">
              <div className="flex justify-between items-center mb-4">
                  <span className="text-white font-medium">{today.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <span className="text-xs text-slate-500">{filteredHistory.length} Workouts Found</span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                  {['S','M','T','W','T','F','S'].map((d,i) => (
                      <div key={i} className="text-xs text-slate-600 font-bold mb-2">{d}</div>
                  ))}
                  {days.map(day => {
                      const dateString = new Date(today.getFullYear(), today.getMonth(), day).toLocaleDateString();
                      const hasWorkout = Object.keys(workoutsByDate).some(d => d === dateString);
                      
                      return (
                          <div key={day} className={`aspect-square flex items-center justify-center rounded-lg text-xs relative ${hasWorkout ? 'bg-theme-soft text-theme font-bold border border-theme' : 'text-slate-600 bg-slate-900/30'}`}>
                              {day}
                              {hasWorkout && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-theme"></div>}
                          </div>
                      )
                  })}
              </div>
          </div>
      );
  }

  const renderList = () => (
      <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
        {filteredHistory.slice().reverse().map((session) => (
            <div 
                key={session.id} 
                onClick={() => setSelectedSession(session)}
                className="bg-card p-4 rounded-xl border border-slate-800 group hover:border-slate-700 transition-all cursor-pointer active:scale-[0.99]"
            >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-white">{session.title}</h3>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                        <span>{session.date}</span>
                        <span>•</span>
                        <span>{session.programType}</span>
                        {session.durationSeconds > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center"><Clock size={10} className="mr-1"/> {Math.floor(session.durationSeconds / 60)}m</span>
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
            {session.notes && (
                <div className="text-xs text-slate-400 bg-slate-900/50 p-2 rounded border border-slate-800/50 flex items-start gap-2">
                    <FileText size={14} className="shrink-0 mt-0.5 opacity-50" />
                    <span className="italic truncate w-full">"{session.notes}"</span>
                </div>
            )}
            </div>
        ))}
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
                    onChange={(e) => setFilterLift(e.target.value as LiftType | 'All')}
                    className="bg-transparent text-xs font-bold text-white py-2 focus:outline-none appearance-none pr-4"
                 >
                     <option value="All">All Lifts</option>
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
                            onClick={handleShareImage}
                            className="bg-slate-800 p-2 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-700"
                            title="Save as Image"
                        >
                            <ImageIcon size={18} />
                        </button>
                        <button 
                            onClick={handleShareText}
                            className="flex items-center space-x-2 bg-theme-soft text-theme px-3 py-1.5 rounded-lg hover:bg-theme hover:text-white transition-colors"
                        >
                            <Share2 size={16} />
                            <span className="text-xs font-bold">Share</span>
                        </button>
                     </div>
                 </div>

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
