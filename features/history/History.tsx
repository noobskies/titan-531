
import React, { useState } from 'react';
import { WorkoutSession, LiftType } from '../../types';
import { Calendar as CalendarIcon, List, Share2, Dumbbell, Filter, Search } from 'lucide-react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { generateWorkoutSummary } from '../../services/platform/shareService';
import { HistoryCalendar } from './HistoryCalendar';
import { HistoryList } from './HistoryList';

interface HistoryProps {
  history: WorkoutSession[];
  onDeleteSession: (id: string) => void;
  onUpdateSession: (session: WorkoutSession) => void;
}

export const HistoryView: React.FC<HistoryProps> = ({ history, onDeleteSession, onUpdateSession }) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [editingSession, setEditingSession] = useState<WorkoutSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<WorkoutSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLift, setFilterLift] = useState<string>('All');

  // Filtering Logic
  const filteredHistory = history.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (session.notes && session.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLift = filterLift === 'All' || 
                          (session.type === 'Conditioning' && filterLift === 'Conditioning') ||
                          session.lift === filterLift;
      return matchesSearch && matchesLift;
  });

  const handleDelete = (id: string) => {
      if (window.confirm("Are you sure you want to delete this workout?")) {
          onDeleteSession(id);
          if (selectedSession?.id === id) setSelectedSession(null);
      }
  };

  const handleShareText = async () => {
      if (!selectedSession) return;
      const text = generateWorkoutSummary(selectedSession);
      try {
          await navigator.clipboard.writeText(text);
          alert("Summary copied to clipboard!");
      } catch (err) {
          console.error('Failed to copy: ', err);
      }
  };

  return (
    <div className="p-4 space-y-4">
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
                      <Button fullWidth onClick={() => { onUpdateSession(editingSession); setEditingSession(null); }}>Save Changes</Button>
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
                        <button onClick={handleShareText} className="flex items-center space-x-2 bg-theme-soft text-theme px-3 py-1.5 rounded-lg hover:bg-theme hover:text-white transition-colors">
                            <Share2 size={16} />
                            <span className="text-xs font-bold">Share</span>
                        </button>
                     </div>
                 </div>

                 {selectedSession.type === 'Conditioning' && selectedSession.conditioningData ? (
                     <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                         <div><div className="text-xs text-slate-500 uppercase">Activity</div><div className="text-lg font-bold text-white">{selectedSession.conditioningData.activity}</div></div>
                         <div><div className="text-xs text-slate-500 uppercase">Duration</div><div className="text-lg font-bold text-white">{Math.floor(selectedSession.durationSeconds / 60)} min</div></div>
                         {selectedSession.conditioningData.distance && <div><div className="text-xs text-slate-500 uppercase">Distance</div><div className="text-lg font-bold text-white">{selectedSession.conditioningData.distance} {selectedSession.conditioningData.distanceUnit}</div></div>}
                         <div><div className="text-xs text-slate-500 uppercase">Intensity</div><div className="text-lg font-bold text-white">{selectedSession.conditioningData.intensity}</div></div>
                     </div>
                 ) : (
                     <div className="space-y-6">
                         {selectedSession.exercises.map((ex, i) => (
                             <div key={i} className="space-y-2">
                                 <div className="flex justify-between items-center">
                                     <div className="flex items-center space-x-2">
                                         <div className={`p-1.5 rounded-md ${ex.completed ? 'bg-green-900/20 text-green-500' : 'bg-slate-800 text-slate-500'}`}><Dumbbell size={16} /></div>
                                         <span className="font-bold text-white">{ex.name}</span>
                                     </div>
                                     <span className="text-xs text-slate-500">{ex.type}</span>
                                 </div>
                                 <div className="grid grid-cols-4 gap-2 pl-8">
                                     {ex.sets.map((set, j) => (
                                         <div key={j} className={`text-xs text-center p-1.5 rounded border ${set.completed ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-900 border-slate-800 text-slate-600'}`}>
                                             <div className="font-bold">{set.weight}</div>
                                             <div className="text-[10px] text-slate-400">x{set.actualReps || set.reps}</div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
                 {selectedSession.notes && <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 italic">"{selectedSession.notes}"</div>}
                 <div className="pt-2"><Button fullWidth variant="secondary" onClick={() => setSelectedSession(null)}>Close</Button></div>
             </div>
         )}
      </Modal>

      <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Logs</h2>
          <div className="flex bg-slate-800 rounded-lg p-1">
              <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded ${viewMode === 'calendar' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><CalendarIcon size={18} /></button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-slate-600 text-white' : 'text-slate-400'}`}><List size={18} /></button>
          </div>
      </div>
      
      {viewMode === 'calendar' ? <HistoryCalendar history={filteredHistory} /> : <HistoryList history={filteredHistory} onEdit={setEditingSession} onDelete={handleDelete} onSelect={setSelectedSession} />}
      {viewMode === 'calendar' && <div className="mt-6"><h3 className="text-lg font-bold text-white mb-3">Recent Logs</h3><HistoryList history={filteredHistory.slice(-5)} onEdit={setEditingSession} onDelete={handleDelete} onSelect={setSelectedSession} /></div>}
    </div>
  );
};
