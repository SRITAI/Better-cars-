import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Search,
  X,
  Crosshair,
  Check,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useLocation } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';

interface CityInfo {
  name: string;
  state: string;
  carCount: string;
  popular?: boolean;
}

const POPULAR_METROS = [
  'Mumbai',
  'Delhi NCR',
  'Bengaluru',
  'Hyderabad',
  'Pune',
  'Chennai',
  'Ahmedabad',
  'Kolkata',
];

const ALL_CITIES: CityInfo[] = [
  { name: 'Mumbai', state: 'Maharashtra', carCount: '2,840+ Cars', popular: true },
  { name: 'Delhi NCR', state: 'Delhi, Gurgaon, Noida', carCount: '3,120+ Cars', popular: true },
  { name: 'Bengaluru', state: 'Karnataka', carCount: '2,450+ Cars', popular: true },
  { name: 'Hyderabad', state: 'Telangana', carCount: '1,780+ Cars', popular: true },
  { name: 'Pune', state: 'Maharashtra', carCount: '1,520+ Cars', popular: true },
  { name: 'Chennai', state: 'Tamil Nadu', carCount: '1,340+ Cars', popular: true },
  { name: 'Kolkata', state: 'West Bengal', carCount: '1,150+ Cars', popular: true },
  { name: 'Ahmedabad', state: 'Gujarat', carCount: '1,280+ Cars', popular: true },
  { name: 'Jaipur', state: 'Rajasthan', carCount: '890+ Cars', popular: true },
  { name: 'Chandigarh', state: 'Punjab / Haryana', carCount: '940+ Cars', popular: true },
  { name: 'Lucknow', state: 'Uttar Pradesh', carCount: '810+ Cars', popular: true },
  { name: 'Kochi', state: 'Kerala', carCount: '760+ Cars', popular: true },
  { name: 'Indore', state: 'Madhya Pradesh', carCount: '680+ Cars' },
  { name: 'Surat', state: 'Gujarat', carCount: '720+ Cars' },
  { name: 'Coimbatore', state: 'Tamil Nadu', carCount: '540+ Cars' },
  { name: 'Nagpur', state: 'Maharashtra', carCount: '490+ Cars' },
  { name: 'Bhopal', state: 'Madhya Pradesh', carCount: '430+ Cars' },
  { name: 'Vadodara', state: 'Gujarat', carCount: '510+ Cars' },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', carCount: '460+ Cars' },
  { name: 'Patna', state: 'Bihar', carCount: '380+ Cars' },
  { name: 'Ludhiana', state: 'Punjab', carCount: '420+ Cars' },
  { name: 'Dehradun', state: 'Uttarakhand', carCount: '340+ Cars' },
  { name: 'Goa', state: 'Goa', carCount: '310+ Cars' },
];

export default function LocationModal() {
  const { city, setCity, isLocationModalOpen, closeLocationModal } = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isLocationModalOpen) {
        closeLocationModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLocationModalOpen, closeLocationModal]);

  // Filter cities by search query
  const query = searchQuery.trim().toLowerCase();
  const filteredCities = ALL_CITIES.filter((c) =>
    c.name.toLowerCase().includes(query) ||
    c.state.toLowerCase().includes(query)
  );

  const exactMatchExists = ALL_CITIES.some(
    (c) => c.name.toLowerCase() === query
  );

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    setToastMessage(`Location changed to ${cityName}`);
    setTimeout(() => {
      setToastMessage(null);
      closeLocationModal();
    }, 450);
  };

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Attempt reverse geocoding via OpenStreetMap or fallback to closest metro
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`)
            .then((res) => res.json())
            .then((data) => {
              const detectedCity =
                data.address?.city ||
                data.address?.town ||
                data.address?.state_district ||
                data.address?.state ||
                'Mumbai';
              setIsLocating(false);
              handleSelectCity(detectedCity);
            })
            .catch(() => {
              setIsLocating(false);
              handleSelectCity('Mumbai');
            });
        },
        () => {
          // If permission denied or unavailable
          setTimeout(() => {
            setIsLocating(false);
            handleSelectCity('Mumbai');
          }, 600);
        },
        { timeout: 6000 }
      );
    } else {
      setTimeout(() => {
        setIsLocating(false);
        handleSelectCity('Mumbai');
      }, 500);
    }
  };

  return (
    <AnimatePresence>
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeLocationModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden my-4 z-10 ${
              isDark
                ? 'bg-[#111218] border-white/10 text-white shadow-black/90'
                : 'bg-white border-gray-200 text-gray-900 shadow-2xl'
            }`}
          >
            {/* Header */}
            <div className={`p-5 sm:p-6 pb-4 border-b flex items-center justify-between ${
              isDark ? 'border-white/10' : 'border-gray-100'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span>Select Your City</span>
                    <span className="text-[10px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-bold">
                      Current: {city}
                    </span>
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Cars, test drive slots, and doorstep inspections are tailored to your location
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeLocationModal}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDark
                    ? 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Detect Bar */}
            <div className="p-5 sm:p-6 pb-3 space-y-3">
              <div className="flex items-center gap-2.5">
                {/* Search input */}
                <div className="relative flex-1">
                  <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-white/40' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search city, state or enter custom location..."
                    autoFocus
                    className={`w-full pl-10 pr-9 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all ${
                      isDark
                        ? 'bg-white/5 border-white/15 text-white placeholder:text-white/30 focus:border-orange-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Auto Detect Button */}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isDark
                      ? 'bg-white/5 border-white/15 text-orange-400 hover:bg-orange-500/10 hover:border-orange-500/50'
                      : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  }`}
                  title="Detect current location via GPS"
                >
                  {isLocating ? (
                    <div className="w-3.5 h-3.5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
                  ) : (
                    <Crosshair className="w-3.5 h-3.5 text-orange-500" />
                  )}
                  <span>Auto-Detect</span>
                </button>
              </div>

              {/* Quick Metro Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                <span className={`text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                  isDark ? 'text-white/40' : 'text-gray-400'
                }`}>
                  Top:
                </span>
                {POPULAR_METROS.map((metro) => {
                  const isCurrent = city.toLowerCase() === metro.toLowerCase();
                  return (
                    <button
                      key={metro}
                      type="button"
                      onClick={() => handleSelectCity(metro)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold whitespace-nowrap transition-all ${
                        isCurrent
                          ? 'bg-orange-500 text-white border-orange-500 font-bold'
                          : isDark
                          ? 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {metro}
                    </button>
                  );
                })}
              </div>

              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{toastMessage}</span>
                </motion.div>
              )}
            </div>

            {/* Custom City Entry Banner (when typing custom city not in standard list) */}
            {searchQuery.trim() && !exactMatchExists && (
              <div className="px-5 sm:px-6 pb-2">
                <button
                  type="button"
                  onClick={() => handleSelectCity(searchQuery.trim())}
                  className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all group ${
                    isDark
                      ? 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-white'
                      : 'bg-orange-50 border-orange-200 hover:bg-orange-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold">
                        Set location to "{searchQuery.trim()}"
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Pan-India doorstep delivery & evaluation available
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-orange-500 text-xs font-bold group-hover:translate-x-1 transition-transform">
                    <span>Select</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            )}

            {/* Cities Grid */}
            <div className="px-5 sm:px-6 pb-6 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {searchQuery ? `Matching Hubs (${filteredCities.length})` : 'All Major Hubs & Delivery Cities'}
                </span>
                <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Home Test Drives in all locations
                </span>
              </div>

              {filteredCities.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-white/30' : 'text-gray-300'}`} />
                  <p className={`text-xs font-semibold ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    No direct warehouse found for "{searchQuery}"
                  </p>
                  <p className={`text-[11px] mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    You can still set your location to "{searchQuery}" above, or pick our nearest metro hub.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleSelectCity('Mumbai')}
                    className="mt-3 text-xs font-bold text-orange-500 hover:underline"
                  >
                    Select Mumbai (Main Headquarters)
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredCities.map((item) => {
                    const isSelected = city.toLowerCase() === item.name.toLowerCase();

                    return (
                      <motion.button
                        key={item.name}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectCity(item.name)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden group cursor-pointer ${
                          isSelected
                            ? 'border-orange-500 bg-orange-500/10 ring-2 ring-orange-500/40 text-orange-500'
                            : isDark
                            ? 'border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8 text-white'
                            : 'border-gray-200 bg-gray-50/80 hover:border-orange-300 hover:bg-orange-50/40 text-gray-800'
                        }`}
                      >
                        {/* Checkmark icon for selected */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}

                        <p className="font-bold text-xs sm:text-sm text-inherit flex items-center gap-1">
                          <span>{item.name}</span>
                        </p>
                        <p className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-white/45' : 'text-gray-400'}`}>
                          {item.state}
                        </p>
                        <span className={`inline-block text-[10px] font-semibold mt-1.5 ${
                          isSelected ? 'text-orange-400 font-bold' : isDark ? 'text-white/60' : 'text-gray-600'
                        }`}>
                          {item.carCount}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Assurance Strip */}
            <div className={`px-6 py-3 border-t text-[11px] flex items-center justify-between ${
              isDark ? 'bg-black/40 border-white/10 text-white/45' : 'bg-gray-50 border-gray-100 text-gray-500'
            }`}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                <span>Pan-India RC Transfer & 7-Day Money Back Guarantee</span>
              </div>
              <span className="font-semibold text-orange-500">20+ Hubs Nationwide</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
