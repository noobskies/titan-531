
import React, { useState } from 'react';
import { UserProfile, ExerciseInfo } from '../../types';
import { EXERCISE_DB } from '../../constants';
import { Button } from '../../components/Button';
import { ChevronLeft, Plus, Trash2, Search, Dumbbell } from 'lucide-react';
import { Modal } from '../../components/Modal';

interface ExerciseManagerProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onBack: () => void;
}

export const ExerciseManager: React.FC<ExerciseManagerProps> = ({ profile, onUpdateProfile, onBack }) => {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<ExerciseInfo['category']>('Main');
  const [newInstructions, setNewInstructions] = useState('');
  const [newVideo, setNewVideo] = useState('');

  const customExercises = profile.customExercises || [];
  
  // Merge dictionaries for display (Custom + Default)
  const allExercises = [
      ...customExercises,
      ...Object.values(EXERCISE_DB)
  ].sort((a, b) => a.name.localeCompare(b.name));

  const filtered = allExercises.filter(ex => 
      ex.name.toLowerCase().includes(search.toLowerCase()) || 
      ex.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
      if (!newName) return;
      const newEx: ExerciseInfo = {
          name: newName,
          category: newCategory,
          instructions: newInstructions || "No instructions provided.",
          videoUrl: newVideo
      };

      onUpdateProfile({
          ...profile,
          customExercises: [...customExercises, newEx]
      });
      
      // Reset
      setNewName('');
      setNewCategory('Main');
      setNewInstructions('');
      setNewVideo('');
      setIsModalOpen(false);
  };

  const handleDelete = (name: string) => {
      if (window.confirm(`Delete custom exercise "${name}"?`)) {
          onUpdateProfile({
              ...profile,
              customExercises: customExercises.filter(c => c.name !== name)
          });
      }
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
       <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-4">
            <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
            <ChevronLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold text-white">Exercise DB</h2>
        </div>
        <Button onClick={() => setIsModalOpen(true)} size="sm">
            <Plus size={18} className="mr-1" /> New
        </Button>
      </div>

      <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
      </div>

      <div className="space-y-2">
          {filtered.map((ex, i) => {
              const isCustom = customExercises.some(c => c.name === ex.name);
              return (
                  <div key={`${ex.name}-${i}`} className="bg-card p-4 rounded-xl border border-slate-800 flex justify-between items-center group">
                      <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-white">{ex.name}</h3>
                            {isCustom && <span className="text-[10px] bg-indigo-900/50 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-900/50">CUSTOM</span>}
                          </div>
                          <p className="text-xs text-slate-500">{ex.category}</p>
                      </div>
                      
                      {isCustom ? (
                          <button 
                            onClick={() => handleDelete(ex.name)} 
                            className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                          >
                              <Trash2 size={16} />
                          </button>
                      ) : (
                          <Dumbbell size={16} className="text-slate-700" />
                      )}
                  </div>
              );
          })}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Exercise">
          <div className="space-y-4">
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Name</label>
                  <input value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="e.g. Cable Fly" />
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Category</label>
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white">
                      <option value="Push">Push</option>
                      <option value="Pull">Pull</option>
                      <option value="Legs">Legs</option>
                      <option value="Core">Core</option>
                      <option value="Main">Main</option>
                      <option value="Other">Other</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Instructions</label>
                  <textarea value={newInstructions} onChange={e => setNewInstructions(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white h-20" placeholder="Form cues..." />
              </div>
              <div>
                  <label className="block text-xs text-slate-400 mb-1">Video URL (Optional)</label>
                  <input value={newVideo} onChange={e => setNewVideo(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" placeholder="https://youtube.com/..." />
              </div>
              <Button fullWidth onClick={handleAdd} disabled={!newName}>Save Exercise</Button>
          </div>
      </Modal>
    </div>
  );
};
