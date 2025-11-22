
import React, { useState, useRef } from 'react';
import { Button } from '../../components/Button';
import { EXERCISE_DB } from '../../constants';
import { analyzeForm } from '../../services/api/geminiService';
import { Upload, Video, Loader, CheckCircle, AlertTriangle, PlayCircle, WifiOff } from 'lucide-react';
import { useUI } from '../../context/UIContext';

export const FormCheck: React.FC = () => {
  const { isOffline } = useUI();
  const [selectedExercise, setSelectedExercise] = useState(Object.keys(EXERCISE_DB)[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
          alert("File too large. Please upload a video under 20MB.");
          return;
      }
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result as string;
        encoded = encoded.split(',')[1];
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyze = async () => {
      if (!mediaFile || isOffline) return;
      setLoading(true);
      setAnalysis(null);

      try {
          const base64Data = await toBase64(mediaFile);
          const mimeType = mediaFile.type;
          const result = await analyzeForm(selectedExercise, base64Data, mimeType);
          setAnalysis(result);
      } catch (error) {
          setAnalysis("Failed to analyze video.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl h-full overflow-y-auto">
        <div className="text-center mb-6">
            <div className="bg-blue-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video size={32} className="text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Form Check</h3>
            <p className="text-xs text-slate-400">Upload a video of your lift for instant feedback.</p>
        </div>

        <div className="space-y-4">
            <div>
                <label className="block text-xs text-slate-400 mb-1">Select Exercise</label>
                <select 
                    value={selectedExercise}
                    onChange={(e) => setSelectedExercise(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {Object.keys(EXERCISE_DB).sort().map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                    ))}
                </select>
            </div>

            <div 
                onClick={() => !isOffline && fileInputRef.current?.click()}
                className={`border-2 border-dashed border-slate-700 rounded-xl p-6 text-center transition-colors ${isOffline ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800/50'}`}
            >
                {mediaFile ? (
                    <div className="flex flex-col items-center">
                        {mediaFile.type.startsWith('video') ? (
                             <video src={previewUrl!} className="max-h-40 rounded mb-2" controls />
                        ) : (
                             <img src={previewUrl!} className="max-h-40 rounded mb-2 object-cover" />
                        )}
                        <span className="text-sm text-green-400 font-bold flex items-center">
                            <CheckCircle size={14} className="mr-1" /> {mediaFile.name}
                        </span>
                        <span className="text-xs text-slate-500 mt-1">Click to change</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-slate-400">
                        <Upload size={24} className="mb-2 opacity-70" />
                        <span className="text-sm font-bold">Upload Video/Image</span>
                        <span className="text-xs opacity-60 mt-1">Max 20MB</span>
                    </div>
                )}
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileSelect} 
                    className="hidden" 
                    accept="video/*,image/*" 
                    disabled={isOffline}
                />
            </div>

            {isOffline ? (
                <div className="flex items-center justify-center space-x-2 text-slate-500 bg-slate-800 p-3 rounded-lg">
                    <WifiOff size={18} />
                    <span className="text-sm">Offline. AI Analysis disabled.</span>
                </div>
            ) : (
                <Button 
                    fullWidth 
                    onClick={handleAnalyze} 
                    disabled={!mediaFile || loading}
                    className={loading ? 'opacity-80' : ''}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <Loader className="animate-spin mr-2" size={18} />
                            Analyzing Form...
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <PlayCircle className="mr-2" size={18} />
                            Analyze Form
                        </div>
                    )}
                </Button>
            )}

            {analysis && (
                <div className="mt-6 bg-slate-900/50 p-4 rounded-xl border border-slate-800 animate-in slide-in-from-bottom-2">
                    <h4 className="text-blue-400 font-bold mb-3 flex items-center">
                        <CheckCircle size={18} className="mr-2" /> Analysis Report
                    </h4>
                    <div className="prose prose-invert prose-sm max-w-none">
                        <div className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {analysis}
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
