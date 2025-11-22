
import React, { useRef, useState } from 'react';
import { UserProfile, LiftType, AppView, ThemeColor } from '../types';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { ChevronLeft, Download, Upload, Trash2, Save, AlertTriangle, Clock, Edit3, Plus, X, TrendingUp, Crown, Volume2, VolumeX, Settings as SettingsIcon, Users, Globe, Dumbbell, Disc, Calendar, Bell, Palette, Layout, Mic, Layers, Database, FileText } from 'lucide-react';
import { EXERCISE_DB, DEFAULT_ASSISTANCE, WEEK_MULTIPLIERS, WEEK_REPS, ASSISTANCE_TEMPLATES, BAR_WEIGHT_LBS, BAR_WEIGHT_KG, THEME_COLORS, DEFAULT_PLATE_INVENTORY_LBS, DEFAULT_PLATE_INVENTORY_KG } from '../constants';
import { TRANSLATIONS } from '../translations';
import { requestNotificationPermission, sendTestNotification } from '../services/notificationService';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showProgramEdit, setShowProgramEdit] = useState(false);
  const [showInventoryEdit, setShowInventoryEdit] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);
  
  // Local state for program editing
  const [customPcts, setCustomPcts] = useState<Record<number, number[]>>(profile.customPercentages || WEEK_MULTIPLIERS);
  const [customReps, setCustomReps] = useState<Record<number, number[]>>(profile.customReps || WEEK_REPS);

  // Local state for inventory
  const isKg = profile.unit === 'kg';
  const defaultInv = isKg ? DEFAULT_PLATE_INVENTORY_KG : DEFAULT_PLATE_INVENTORY_LBS;
  const [inventory, setInventory] = useState<Record<number, number>>(profile.plateInventory || defaultInv);

  const t = TRANSLATIONS[profile.language || 'en'];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleRoundingChange = (val: string) => {
    onUpdateProfile({ ...profile, rounding: parseFloat(val) });
  };

  const handleUnitChange = (unit: 'lbs' | 'kg') => {
      onUpdateProfile({ ...profile, unit, plateInventory: undefined }); // Reset inventory on unit change
  }

  const handleTimerChange = (type: 'main' | 'supplemental' | 'assistance', val: number) => {
      const newSettings = { ...profile.timerSettings, [type]: val };
      onUpdateProfile({ ...profile, timerSettings: newSettings });
  }
  
  const handleAssistanceSettingChange = (type: 'sets' | 'reps', val: number) => {
      const newSettings = { ...profile.assistanceSettings, [type]: val };
      onUpdateProfile({ ...profile, assistanceSettings: newSettings });
  }

  const toggleSound = () => {
      onUpdateProfile({ ...profile, soundEnabled: !profile.soundEnabled });
  }

  const toggleVoice = () => {
      onUpdateProfile({ ...profile, voiceEnabled: !profile.voiceEnabled });
  }

  const toggleCoachMode = () => {
      onUpdateProfile({ ...profile, isCoach: !profile.isCoach });
  }

  const toggleNotifications = async () => {
      if (!profile.notificationsEnabled) {
          const granted = await requestNotificationPermission();
          if (granted) {
              onUpdateProfile({ ...profile, notificationsEnabled: true });
              sendTestNotification();
          } else {
              alert("Permission denied. Please enable notifications in your browser settings.");
          }
      } else {
          onUpdateProfile({ ...profile, notificationsEnabled: false });
      }
  };

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

  const saveInventory = () => {
      onUpdateProfile({ ...profile, plateInventory: inventory });
      setShowInventoryEdit(false);
  };

  const applyAssistanceTemplate = (templateName: string) => {
      if (ASSISTANCE_TEMPLATES[templateName]) {
          onUpdateProfile({ ...profile, customAssistance: ASSISTANCE_TEMPLATES[templateName] });
          alert(`${templateName} template applied!`);
      }
  };

  // --- Program Edit Logic ---
  const handlePctChange = (week: number, setIdx: number, val: string) => {
      const newPcts = { ...customPcts };
      const weekPcts = [...(newPcts[week] || [0,0,0])];
      weekPcts[setIdx] = parseFloat(val) / 100;
      newPcts[week] = weekPcts;
      setCustomPcts(newPcts);
  };

  const handleRepChange = (week: number, setIdx: number, val: string) => {
      const newReps = { ...customReps };
      const weekReps = [...(newReps[week] || [0,0,0])];
      weekReps[setIdx] = parseInt(val);
      newReps[week] = weekReps;
      setCustomReps(newReps);
  };

  const saveCustomProgram = () => {
      onUpdateProfile({ ...profile, customPercentages: customPcts, customReps: customReps });
      setShowProgramEdit(false);
  };

  const resetProgramToDefault = () => {
      setCustomPcts(WEEK_MULTIPLIERS);
      setCustomReps(WEEK_REPS);
  };

  return (
    <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300 pb-32">
      <div className="flex items-center space-x-4 mb-6">
        <button onClick={onBack} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
          <ChevronLeft size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">{t.settings_title}</h2>
      </div>

      {/* Theme & Display */}
      <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Appearance</h3>
          <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
              {/* Theme Color */}
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

              {/* Language */}
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
      </section>

      {/* Schedule & Equipment */}
      <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Schedule & Equipment</h3>
          <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
              {/* Training Days */}
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

              {/* Bar Weight */}
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

              {/* Plate Inventory */}
               <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <Layers size={16} className="mr-2 text-slate-400" /> {t.settings_inventory || 'Plate Inventory'}
                  </label>
                  <Button variant="secondary" fullWidth onClick={() => setShowInventoryEdit(true)}>
                      Manage Plates
                  </Button>
              </div>
          </div>
      </section>

      {/* Program Configuration */}
      <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Program Config</h3>
          <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
              
              {/* Custom Percentages */}
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <Edit3 size={16} className="mr-2 text-slate-400" /> {t.settings_program_custom}
                  </label>
                  <Button variant="secondary" fullWidth onClick={() => setShowProgramEdit(true)}>
                      Customize Percentages & Reps
                  </Button>
              </div>

              {/* Assistance Templates */}
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <Layout size={16} className="mr-2 text-slate-400" /> Assistance Template
                  </label>
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

              {/* Assistance Volume */}
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-3">Assistance Volume</label>
                  <div className="flex gap-4">
                      <div className="flex-1">
                          <label className="text-xs text-slate-500 block mb-1">Sets</label>
                          <input 
                            type="number" 
                            min="1" max="10"
                            value={profile.assistanceSettings?.sets || 3}
                            onChange={(e) => handleAssistanceSettingChange('sets', parseInt(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                          />
                      </div>
                      <div className="flex-1">
                          <label className="text-xs text-slate-500 block mb-1">Reps</label>
                          <input 
                            type="number" 
                            min="1" max="50"
                            value={profile.assistanceSettings?.reps || 10}
                            onChange={(e) => handleAssistanceSettingChange('reps', parseInt(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white"
                          />
                      </div>
                  </div>
              </div>

              {/* Exercise Manager */}
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                      <Dumbbell size={16} className="mr-2 text-slate-400" /> Custom Exercises
                  </label>
                  <Button variant="secondary" fullWidth onClick={() => onChangeView && onChangeView(AppView.ExerciseManager)}>
                      Manage Exercises
                  </Button>
              </div>
          </div>
      </section>

      {/* Preferences */}
      <section className="space-y-4">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">App Preferences</h3>
        
        <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t.settings_units}</label>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                onClick={() => handleUnitChange('lbs')}
                className={`flex-1 py-2 rounded text-sm font-medium transition-all ${profile.unit === 'lbs' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
              >
                LBS
              </button>
              <button
                onClick={() => handleUnitChange('kg')}
                className={`flex-1 py-2 rounded text-sm font-medium transition-all ${profile.unit === 'kg' ? 'bg-slate-700 text-white shadow' : 'text-slate-500'}`}
              >
                KG
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Sound Effects</label>
                <button 
                    onClick={toggleSound} 
                    className={`w-full p-3 rounded-lg flex items-center justify-between border transition-colors ${
                        profile.soundEnabled 
                        ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <span className="text-sm">{profile.soundEnabled ? 'On' : 'Off'}</span>
                    {profile.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </button>
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t.settings_voice}</label>
                <button 
                    onClick={toggleVoice} 
                    className={`w-full p-3 rounded-lg flex items-center justify-between border transition-colors ${
                        profile.voiceEnabled 
                        ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <span className="text-sm">{profile.voiceEnabled ? 'On' : 'Off'}</span>
                    <Mic size={18} />
                </button>
              </div>
          </div>
          
           <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">Notifications</label>
                 <button 
                    onClick={toggleNotifications} 
                    className={`w-full p-3 rounded-lg flex items-center justify-between border transition-colors ${
                        profile.notificationsEnabled 
                        ? 'bg-blue-900/20 border-blue-500/50 text-blue-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-500'
                    }`}
                >
                    <span className="text-sm">{profile.notificationsEnabled ? 'On' : 'Off'}</span>
                    <Bell size={18} />
                </button>
            </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Weight Rounding</label>
            <select
              value={profile.rounding}
              onChange={(e) => handleRoundingChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            >
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
                 <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Main Lifts</span>
                        <span>{profile.timerSettings?.main || 180}s</span>
                    </div>
                    <input 
                        type="range" min="60" max="300" step="15" 
                        value={profile.timerSettings?.main || 180} 
                        onChange={(e) => handleTimerChange('main', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                 </div>
                 <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Supplemental</span>
                        <span>{profile.timerSettings?.supplemental || 120}s</span>
                    </div>
                    <input 
                        type="range" min="30" max="300" step="15" 
                        value={profile.timerSettings?.supplemental || 120} 
                        onChange={(e) => handleTimerChange('supplemental', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                 </div>
                 <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Assistance</span>
                        <span>{profile.timerSettings?.assistance || 90}s</span>
                    </div>
                    <input 
                        type="range" min="30" max="180" step="15" 
                        value={profile.timerSettings?.assistance || 90} 
                        onChange={(e) => handleTimerChange('assistance', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                 </div>
             </div>
          </div>
        </div>
      </section>

      {/* Coach / Pro Mode */}
      <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Professional</h3>
          <div className="bg-card p-4 rounded-xl border border-slate-800">
              <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center">
                  <Users size={16} className="mr-2 text-slate-400" /> {t.settings_coach_mode}
              </label>
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                  <span className="text-xs text-slate-400 max-w-[70%]">
                      Enable tools for managing multiple clients and tracking their progress.
                  </span>
                  <button 
                    onClick={toggleCoachMode}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${profile.isCoach ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${profile.isCoach ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
              </div>
          </div>
      </section>

      {/* Data Management */}
      <section className="space-y-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Data Management</h3>
          <div className="bg-card p-4 rounded-xl border border-slate-800 space-y-3">
              <Button variant="secondary" fullWidth onClick={onExport}>
                  <Download size={18} className="mr-2" /> Export Data (JSON)
              </Button>
              <Button variant="secondary" fullWidth onClick={() => fileInputRef.current?.click()}>
                  <Upload size={18} className="mr-2" /> Import Data
              </Button>
              <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={onImport} 
                  accept=".json" 
                  className="hidden" 
              />
          </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
          <button onClick={() => setShowDangerZone(!showDangerZone)} className="text-xs text-red-500 font-bold uppercase tracking-wider flex items-center">
              <AlertTriangle size={12} className="mr-1" /> Danger Zone
          </button>
          
          {showDangerZone && (
              <div className="bg-red-900/10 p-4 rounded-xl border border-red-900/30 animate-in fade-in">
                  <p className="text-xs text-red-300 mb-4">
                      These actions cannot be undone. Please be certain.
                  </p>
                  <Button variant="danger" size="sm" fullWidth onClick={() => {
                      if(window.confirm("Are you absolutely sure you want to delete all data?")) onReset();
                  }}>
                      <Trash2 size={16} className="mr-2" /> Reset Everything
                  </Button>
              </div>
          )}
      </section>

      {/* Modal for Inventory */}
      <Modal isOpen={showInventoryEdit} onClose={() => setShowInventoryEdit(false)} title="Plate Inventory">
          <div className="space-y-4">
              <p className="text-xs text-slate-400">Specify how many of each plate you have available. The calculator will only use these.</p>
              <div className="grid grid-cols-2 gap-3">
                  {Object.keys(defaultInv).map((w) => (
                      <div key={w} className="flex items-center justify-between bg-slate-900 p-2 rounded border border-slate-800">
                          <span className="font-bold text-white">{w} {profile.unit}</span>
                          <input 
                            type="number"
                            min="0"
                            max="20"
                            step="2"
                            value={inventory[parseFloat(w)] ?? 0}
                            onChange={(e) => setInventory({...inventory, [parseFloat(w)]: parseInt(e.target.value)})}
                            className="w-16 bg-slate-800 border border-slate-700 rounded text-center text-white"
                          />
                      </div>
                  ))}
              </div>
              <Button fullWidth onClick={saveInventory}>Save Inventory</Button>
          </div>
      </Modal>

      {/* Modal for Program Customization */}
      <Modal isOpen={showProgramEdit} onClose={() => setShowProgramEdit(false)} title="Custom Program">
          <div className="space-y-6">
              <div className="flex justify-between items-center">
                  <p className="text-xs text-slate-400">Edit main lift percentages and reps.</p>
                  <button onClick={resetProgramToDefault} className="text-xs text-blue-400 hover:underline">Reset to Default</button>
              </div>

              {/* Percentages Table */}
              <div>
                  <h4 className="text-sm font-bold text-white mb-2">Percentages (%)</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-500 mb-1">
                      <div></div>
                      <div>Set 1</div>
                      <div>Set 2</div>
                      <div>Set 3</div>
                  </div>
                  {[1, 2, 3, 4].map(week => (
                      <div key={week} className="grid grid-cols-4 gap-2 mb-2 items-center">
                          <div className="text-xs font-bold text-slate-400">W{week}</div>
                          {[0, 1, 2].map(setIdx => (
                              <input
                                key={setIdx}
                                type="number"
                                value={Math.round((customPcts[week]?.[setIdx] || 0) * 100)}
                                onChange={(e) => handlePctChange(week, setIdx, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                              />
                          ))}
                      </div>
                  ))}
              </div>

              {/* Reps Table */}
              <div>
                  <h4 className="text-sm font-bold text-white mb-2">Target Reps</h4>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs text-slate-500 mb-1">
                      <div></div>
                      <div>Set 1</div>
                      <div>Set 2</div>
                      <div>Set 3</div>
                  </div>
                  {[1, 2, 3, 4].map(week => (
                      <div key={week} className="grid grid-cols-4 gap-2 mb-2 items-center">
                          <div className="text-xs font-bold text-slate-400">W{week}</div>
                          {[0, 1, 2].map(setIdx => (
                              <input
                                key={setIdx}
                                type="number"
                                value={customReps[week]?.[setIdx] || 0}
                                onChange={(e) => handleRepChange(week, setIdx, e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-center text-white"
                              />
                          ))}
                      </div>
                  ))}
              </div>

              <Button fullWidth onClick={saveCustomProgram}>Save Program Logic</Button>
          </div>
      </Modal>

       <div className="text-center pt-8">
        <p className="text-slate-600 text-xs">Titan 531 v2.0.0</p>
      </div>
    </div>
  );
};
