
import React, { useState } from 'react';
import { Button } from '../../components/Button';
import { findGymsNearby } from '../../services/api/geminiService';
import { MapPin, Navigation, Star, Loader, AlertTriangle, WifiOff } from 'lucide-react';
import { useUI } from '../../context/UIContext';

export const GymFinder: React.FC = () => {
  const { isOffline } = useUI();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{text: string, places: any[]} | null>(null);

  const handleLocate = () => {
    if (isOffline) return;
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await findGymsNearby(latitude, longitude);
          setResults(data);
        } catch (err) {
          setError("Failed to fetch gym data. Please try again.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Unable to retrieve your location. Please allow location access.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="p-4 bg-card rounded-xl border border-slate-800 shadow-xl h-full overflow-y-auto">
      <div className="text-center mb-6">
        <div className="bg-theme-soft w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 border border-theme">
          <MapPin size={32} className="text-theme" />
        </div>
        <h3 className="text-lg font-bold text-white">Gym Finder</h3>
        <p className="text-xs text-slate-400">Locate top-rated strength training facilities near you.</p>
      </div>

      {!results && !loading && (
        <div className="text-center space-y-4">
          <div className="p-6 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/30">
             <p className="text-sm text-slate-300 mb-4">
               We use Google Maps Grounding to find gyms with power racks, deadlift platforms, and heavy dumbbells.
             </p>
             {isOffline ? (
                 <div className="flex items-center justify-center space-x-2 text-slate-500 bg-slate-800 p-3 rounded-lg">
                     <WifiOff size={18} />
                     <span className="text-sm">Offline. Connect to internet to search.</span>
                 </div>
             ) : (
                 <Button onClick={handleLocate} fullWidth>
                    <Navigation size={18} className="mr-2" /> Locate Nearby Gyms
                 </Button>
             )}
          </div>
          {error && (
            <div className="flex items-center justify-center text-red-400 text-xs bg-red-900/10 p-2 rounded border border-red-900/20">
                <AlertTriangle size={14} className="mr-2" /> {error}
            </div>
          )}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader size={32} className="text-theme animate-spin mb-4" />
          <p className="text-sm text-slate-400 animate-pulse">Scanning area for iron temples...</p>
        </div>
      )}

      {results && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4">
           <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-sm text-slate-300 leading-relaxed">
               {results.text}
           </div>

           {results.places && results.places.length > 0 && (
               <div className="space-y-3">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Found Locations</h4>
                   {results.places.map((place, idx) => (
                       <a 
                         key={idx}
                         href={place.uri || place.web?.uri}
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="block bg-card hover:bg-slate-800 p-3 rounded-xl border border-slate-800 hover:border-theme transition-all group"
                       >
                           <div className="flex justify-between items-start">
                               <div>
                                   <h5 className="font-bold text-white group-hover:text-theme transition-colors">{place.title}</h5>
                                   <div className="flex items-center mt-1 space-x-2">
                                       {place.rating && (
                                           <span className="flex items-center text-xs text-yellow-500 font-bold">
                                               <Star size={10} fill="currentColor" className="mr-1"/> {place.rating}
                                           </span>
                                       )}
                                       {place.userRatingCount && (
                                            <span className="text-[10px] text-slate-500">({place.userRatingCount})</span>
                                       )}
                                   </div>
                               </div>
                               <Navigation size={16} className="text-slate-600 group-hover:text-theme" />
                           </div>
                           {place.formattedAddress && (
                               <p className="text-xs text-slate-500 mt-2 truncate">{place.formattedAddress}</p>
                           )}
                       </a>
                   ))}
               </div>
           )}
           
           <div className="pt-4">
               <Button variant="secondary" fullWidth onClick={() => setResults(null)}>Search Again</Button>
           </div>
        </div>
      )}
    </div>
  );
};
