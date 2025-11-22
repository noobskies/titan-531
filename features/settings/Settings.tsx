
import React, { useRef, useState } from 'react';
import { UserProfile, LiftType, AppView, WarmupSetSetting } from '../../types';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { ChevronLeft, Download, Upload, Trash2, AlertTriangle, Plus, Users, Volume2, VolumeX, Bell, Mic, Clock, Smartphone, HelpCircle, Shield } from 'lucide-react';
import { EXERCISE_DB, DEFAULT_ASSISTANCE, WEEK_MULTIPLIERS, WEEK_REPS, DEFAULT_PLATE_INVENTORY_LBS, DEFAULT_PLATE_INVENTORY_KG, WARMUP_SETS } from '../../constants';
import { TRANSLATIONS } from '../../translations';
import { requestNotificationPermission, sendTestNotification } from '../../services/platform/notificationService';
import { AppearanceSection, ScheduleSection, ProgramSection } from './components/SettingsSections';
import { useUI } from '../../context/UIContext';

interface SettingsProps {
  profile: UserProfile;
  onUpdateProfile: (p: UserProfile) => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  onBack: () => void;
  onChangeView?: (view: AppView) => void;
}

export const SettingsView: React.FC<SettingsProps> = ({
  profile,
  onUpdateProfile,
  onExport,
  onImport,
  onReset,
  onBack,
  onChangeView
}) => {
  const { showToast, installPrompt, promptInstall } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgramEdit, setShowProgramEdit] = useState(false);
  const [showInventoryEdit, setShowInventoryEdit] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  const [showAssistanceEdit, setShowAssistanceEdit] = useState(false);
  const [showWarmupEdit, setShowWarmupEdit] = useState(false);
  const [showLiftOrderEdit, setShowLiftOrderEdit] = useState(false);
  
  // Local state for edits
  const [customPcts, setCustomPcts] = useState<Record<number, number[]>>(profile.customPercentages || WEEK_MULTIPLIERS);
  const [customReps, setCustomReps] = useState<Record<number, number[]>>(profile.customReps || WEEK_REPS);
  const [editAssistance, setEditAssistance] = useState<Record<LiftType, string[]>>(profile.customAssistance || DEFAULT_ASSISTANCE);
  const [activeAssistanceLift, setActiveAssistanceLift] = useState<LiftType>(LiftType.Squat);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [editWarmups, setEditWarmups] = useState<WarmupSetSetting[]>(profile.warmupSettings || WARMUP_SETS);
  const [editLiftOrder, setEditLiftOrder] = useState<LiftType[]>(profile.liftOrder || Object.values(LiftType));
  
  const isKg = profile.unit === 'kg';
  const defaultInv = isKg ? DEFAULT_PLATE_INVENTORY_KG : DEFAULT_PLATE_INVENTORY_LBS;
  const [inventory, setInventory] = useState<Record<number, number>>(profile.plateInventory || defaultInv);

  const t = TRANSLATIONS[profile.language || 'en'];

  // General Settings Handlers
  const handleRoundingChange = (val: string) => onUpdateProfile({ ...profile, rounding: parseFloat(val) });
  const handleUnitChange = (unit: 'lbs' | 'kg') => onUpdateProfile({ ...profile, unit, plateInventory: undefined });
  const toggleSound = () => onUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled });
  const toggleVoice = () => onUpdateProfile({ ...profile, voiceEnabled: !profile.voiceEnabled });
  const toggleCoachMode = () => onUpdateProfile({ ...profile, isCoach: !profile.isCoach });
  const handleTimerChange = (type: 'main' | 'supplemental' | 'assistance', val: number) => {
    onUpdateProfile({ ...profile, timerSettings: { ...profile.timerSettings, [type]: val } });
  };

  const toggleNotifications = async () => {
      if (!profile.notificationsEnabled) {
          const granted = await requestNotificationPermission();
          if (granted) {
              onUpdateProfile({ ...profile, notificationsEnabled: true });
              sendTestNotification();
              showToast("Notifications enabled", "success");
          } else {
              showToast("Permission denied. Enable in browser settings.", "error");
          }
      } else {
          onUpdateProfile({ ...profile, notificationsEnabled: false });
          showToast("Notifications disabled", "info");
      }
  };

  // Inventory
  const saveInventory = () => {
      onUpdateProfile({ ...profile, plateInventory: inventory });
      setShowInventoryEdit(false);
      showToast("Inventory saved", "success");
  };

  // Program Edit
  const handlePctChange = (week: number, setIdx: number, val: string) => {
      const newPcts = { ...customPcts };
      newPcts[week] = [...(newPcts[week] || [0,0,0])];
      newPcts[week][setIdx] = parseFloat(val) / 100;
      setCustomPcts(newPcts);
  };

  const handleRepChange = (week: number, setIdx: number, val: string) => {
      const newReps = { ...customReps };
      newReps[week] = [...(newReps[week] || [0,0,0])];
      newReps[week][setIdx] = parseInt(val);
      setCustomReps(newReps);
  };

  const saveCustomProgram = () => {
      onUpdateProfile({ ...profile, customPercentages: customPcts, customReps: customReps });
      setShowProgramEdit(false);
      showToast("Program logic updated", "success");
  };

  // Assistance Edit
  const removeAssistanceExercise = (lift: LiftType, exName: string) => {
      setEditAssistance({ ...editAssistance, [lift]: editAssistance[lift].filter(e => e !== exName) });
  };

  const addAssistanceExercise = (exName: string) => {
      setEditAssistance({ ...editAssistance, [activeAssistanceLift]: [...(editAssistance[activeAssistanceLift] || []), exName] });
      setShowExercisePicker(false);
  };

  const saveAssistance = () => {
      onUpdateProfile({ ...profile, customAssistance: editAssistance });
      setShowAssistanceEdit(false);
      showToast("Assistance updated", "success");
  }

  // Warmup Edit
  const handleWarmupChange = (idx: number, field: 'percentage' | 'reps', val: string) => {
      const newWarmups = [...editWarmups];
      if (field === 'percentage') newWarmups[idx].percentage = parseFloat(val) / 100;
      else newWarmups[idx].reps = parseFloat(val);
      setEditWarmups(newWarmups);
  };
  
  const saveWarmups = () => {
      onUpdateProfile({ ...profile, warmupSettings: editWarmups });
      setShowWarmupEdit(false);
      showToast("Warmups updated", "success");
  };

  // Lift Order
  const moveLift = (idx: number, direction: -1 | 1) => {
      if (idx + direction < 0 || idx + direction >= editLiftOrder.length) return;
      const newOrder = [...editLiftOrder];
      const temp = newOrder[idx];
      newOrder[idx] = newOrder[idx + direction];
      newOrder[idx + direction] = temp;
      setEditLiftOrder(newOrder);
  };

  const saveLiftOrder = () => {
      onUpdateProfile({ ...profile, liftOrder: editLiftOrder });
      setShowLiftOrderEdit(false);
      showToast("Lift order updated", "success");
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">{t.settings_title}</h2>
      </div>

      {/* PWA Install Button */}
      {installPrompt && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-4 rounded-xl shadow-lg border border-blue-400">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white text-sm">Install Titan 531</h3>
                    <p className="text-xs text-blue-100">Add to home screen for the best experience.</p>
                </div>
                <Button size="sm" onClick={promptInstall} className="bg-white text-blue-600 hover:bg-blue-50 border-0">
                    <Smartphone size={16} className="mr-1" /> Install
                </Button>
            </div>
        </div>
      )}

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Appearance</h3>
      <AppearanceSection profile={profile} onUpdateProfile={onUpdateProfile} t={t} />

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Schedule & Equipment</h3>
      <ScheduleSection 
        profile={profile} 
        onUpdateProfile={onUpdateProfile} 
        onOpenLiftOrder={() => setShowLiftOrderEdit(true)}
        onOpenInventory={() => setShowInventoryEdit(true)}
        t={t}
      />

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Program Config</h3>
      <ProgramSection 
        profile={profile}
        onUpdateProfile={onUpdateProfile}
        t={t}
        onOpenProgramEdit={() => setShowProgramEdit(true)}
        onOpenWarmupEdit={() => setShowWarmupEdit(true)}
        onOpenAssistanceEdit={() => setShowAssistanceEdit(true)}
        onManageExercises={() => onChangeView && onChangeView(AppView.ExerciseManager)}
      />

      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">App Preferences</h3>
      <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.settings_units}</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button onClick={() => handleUnitChange('lbs')} className={`flex-1 py-2 rounded text-sm font-medium transition-all ${profile.unit === 'lbs' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}>LBS</button>
              <button onClick={() => handleUnitChange('kg')} className={`flex-1 py-2 rounded text-sm font-medium transition-all ${profile.unit === 'kg' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}>KG</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div onClick={toggleSound} className={`p-3 rounded-lg flex items-center justify-between border transition-colors cursor-pointer ${profile.soundEnabled ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                 <span className="text-sm">Sound</span> {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </div>
               <div onClick={toggleVoice} className={`p-3 rounded-lg flex items-center justify-between border transition-colors cursor-pointer ${profile.voiceEnabled ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                 <span className="text-sm">{t.settings_voice}</span> <Mic size={18} />
              </div>
          </div>
          
           <div onClick={toggleNotifications} className={`p-3 rounded-lg flex items-center justify-between border transition-colors cursor-pointer ${profile.notificationsEnabled ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                 <span className="text-sm">Notifications</span> <Bell size={18} />
            </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Weight Rounding</label>
            <select value={profile.rounding} onChange={(e) => handleRoundingChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none">
              <option value="1">1 {profile.unit}</option>
              <option value="2.5">2.5 {profile.unit}</option>
              <option value="5">5 {profile.unit}</option>
              <option value="10">10 {profile.unit}</option>
            </select>
          </div>

          <div>
             <div className="flex items-center justify-between mb-3">
                 <label className="block text-sm font-medium text-slate-300">Rest Timers</label>
                 <Clock size={16} className="text-slate-500" />
             </div>
             <div className="space-y-4 bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                 {['main', 'supplemental', 'assistance'].map(type => (
                     <div key={type}>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span className="capitalize">{type}</span>
                            <span>{profile.timerSettings?.[type as keyof typeof profile.timerSettings]}s</span>
                        </div>
                        <input type="range" min="30" max="300" step="15" 
                            value={profile.timerSettings?.[type as keyof typeof profile.timerSettings]} 
                            onChange={(e) => handleTimerChange(type as any, parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                     </div>
                 ))}
             </div>
          </div>
      </div>

      {/* Coach / Pro Mode */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Professional</h3>
      <div className="bg-card p-4 rounded-xl border border-slate-800">
          <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
              <Users size={16} className="mr-2 text-slate-400" /> {t.settings_coach_mode}
          </label>
          <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 max-w-[70%]">Enable tools for managing multiple clients and tracking their progress.</span>
              <button onClick={toggleCoachMode} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.isCoach ? 'bg-blue-600' : 'bg-slate-700'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.isCoach ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
          </div>
      </div>

      {/* Data Management */}
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Data Management</h3>
      <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-3">
          <Button variant="secondary" fullWidth onClick={onExport}>
              <Download size={18} className="mr-2" /> Export Data (JSON)
          </Button>
          <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
              <Upload size={18} className="mr-2" /> Import Data
          </Button>
          <input type="file" ref={fileInputRef} onChange={onImport} accept=".json" className="hidden" />
      </div>

      {/* Danger Zone */}
      <button onClick={() => setShowDangerZone(!showDangerZone)} className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center">
          <AlertTriangle size={12} className="mr-1" /> Danger Zone
      </button>
      
      {showDangerZone && (
          <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/30 animate-in fade-in">
              <p className="text-xs text-red-300 mb-4">These actions cannot be undone.</p>
              <Button variant="danger" size="sm" fullWidth onClick={() => {
                  if(window.confirm("Are you absolutely sure you want to delete all data?")) onReset();
              }}>
                  <Trash2 size={16} className="mr-2" /> Reset Everything
              </Button>
          </div>
      )}

      {/* Footer Links */}
      <div className="pt-8 pb-4 flex justify-center space-x-6">
          <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center">
              <Shield size={12} className="mr-1" /> Privacy
          </button>
          <button className="text-xs text-slate-500 hover:text-slate-300 flex items-center">
              <HelpCircle size={12} className="mr-1" /> Feedback
          </button>
      </div>

      <div className="text-center pb-2">
         <p className="text-[10px] text-slate-600">Titan 531 v1.2.1 • Production Build</p>
      </div>

      {/* MODALS */}
      <Modal isOpen={showInventoryEdit} onClose={() => setShowInventoryEdit(false)} title="Plate Inventory">
          <div className="space-y-4">
              <p className="text-xs text-slate-400">Specify how many of each plate you have.</p>
              <div className="grid grid-cols-2 gap-3">
                  {Object.keys(defaultInv).map((w) => (
                      <div key={w} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="font-bold text-white">{w} {profile.unit}</span>
                          <input type="number" min="0" max="20" step="2" value={inventory[parseFloat(w)] ?? 0} onChange={(e) => setInventory({...inventory, [parseFloat(w)]: parseInt(e.target.value)})} className="w-16 bg-slate-800 border border-slate-700 rounded text-center text-white" />
                      </div>
                  ))}
              </div>
              <Button fullWidth onClick={saveInventory}>Save Inventory</Button>
          </div>
      </Modal>

      <Modal isOpen={showProgramEdit} onClose={() => setShowProgramEdit(false)} title="Custom Program">
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Edit main lift percentages and reps.</p>
                  <button onClick={() => { setCustomPcts(WEEK_MULTIPLIERS); setCustomReps(WEEK_REPS); }} className="text-xs text-blue-400 hover:underline">Reset to Default</button>
              </div>
              <div>
                  <h4 className="text-sm font-bold text-white mb-2">Percentages (%)</h4>
                  {[1, 2, 3, 4].map(week => (
                      <div key={week} className="grid grid-cols-4 gap-2 mb-2 items-center">
                          <div className="text-xs font-bold text-slate-400">W{week}</div>
                          {[0, 1, 2].map(setIdx => (
                              <input key={setIdx} type="number" value={Math.round((customPcts[week]?.[setIdx] || 0) * 100)} onChange={(e) => handlePctChange(week, setIdx, e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center text-white" />
                          ))}
                      </div>
                  ))}
              </div>
              <div>
                  <h4 className="text-sm font-bold text-white mb-2">Target Reps</h4>
                  {[1, 2, 3, 4].map(week => (
                      <div key={week} className="grid grid-cols-4 gap-2 mb-2 items-center">
                          <div className="text-xs font-bold text-slate-400">W{week}</div>
                          {[0, 1, 2].map(setIdx => (
                              <input key={setIdx} type="number" value={customReps[week]?.[setIdx] || 0} onChange={(e) => handleRepChange(week, setIdx, e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center text-white" />
                          ))}
                      </div>
                  ))}
              </div>
              <Button fullWidth onClick={saveCustomProgram}>Save Program Logic</Button>
          </div>
      </Modal>

      <Modal isOpen={showAssistanceEdit} onClose={() => setShowAssistanceEdit(false)} title="Assistance Editor">
          <div className="space-y-6 min-h-[50vh]">
             <p className="text-xs text-slate-400">Assign specific assistance exercises.</p>
             <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 overflow-x-auto">
                 {Object.values(LiftType).map(lift => (
                     <button key={lift} onClick={() => setActiveAssistanceLift(lift)} className={`flex-1 py-2 px-1 rounded text-xs font-bold whitespace-nowrap transition-all ${activeAssistanceLift === lift ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}>{lift.split(' ')[0]}</button>
                 ))}
             </div>
             <div>
                 <div className="flex justify-between items-center mb-2">
                     <h4 className="text-sm font-bold text-white">Exercises for {activeAssistanceLift}</h4>
                     <button onClick={() => setShowExercisePicker(true)} className="text-xs text-blue-400 flex items-center"><Plus size={12} className="mr-1" /> Add</button>
                 </div>
                 <div className="space-y-2">
                     {(editAssistance[activeAssistanceLift] || []).map((exName, i) => (
                         <div key={i} className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                             <span className="text-sm text-white">{exName}</span>
                             <button onClick={() => removeAssistanceExercise(activeAssistanceLift, exName)} className="text-slate-500 hover:text-red-500"><Trash2 size={14} /></button>
                         </div>
                     ))}
                 </div>
             </div>
             <Button fullWidth onClick={saveAssistance}>Save Assistance Config</Button>
          </div>
      </Modal>

      <Modal isOpen={showExercisePicker} onClose={() => setShowExercisePicker(false)} title="Add Exercise">
         <div className="space-y-2 h-[60vh] overflow-y-auto">
             {[...profile.customExercises || [], ...Object.values(EXERCISE_DB)].sort((a,b) => a.name.localeCompare(b.name)).map(ex => (
                 <button key={ex.name} onClick={() => addAssistanceExercise(ex.name)} className="w-full text-left p-3 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-sm text-white">
                     {ex.name} <span className="text-slate-500 text-xs ml-2">({ex.category})</span>
                 </button>
             ))}
         </div>
      </Modal>
    </div>
  );
};
