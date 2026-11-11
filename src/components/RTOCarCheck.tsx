import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  FileText,
  AlertCircle,
  ArrowRight,
  Car as CarIcon,
} from 'lucide-react';
import { fetchRTOVehicle, type RTOVehicle } from '../services/rtoService';
import { useTheme } from '../context/ThemeContext';
import SteeringWheelIcon from './SteeringWheelIcon';

const samplePlates = [
  { no: 'DL01AB1234', label: 'Creta 2022 (Delhi)' },
  { no: 'MH02CD5678', label: 'Nexon 2023 (Mumbai)' },
  { no: 'UP16AY9999', label: 'Fortuner 4x4 (Noida)' },
  { no: 'KA05MJ4321', label: 'City ZX (Bengaluru)' },
  { no: 'HR26DQ5555', label: 'Brezza (Gurugram)' },
];

const formatPrice = (p?: number) => {
  if (!p) return '₹--';
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`;
  if (p >= 100000) return `₹${(p / 100000).toFixed(2)} Lakh`;
  return `₹${p.toLocaleString('en-IN')}`;
};

interface RTOCarCheckProps {
  onSellThisCar?: (vehicle: RTOVehicle) => void;
}

export default function RTOCarCheck({ onSellThisCar }: RTOCarCheckProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [regInput, setRegInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchedVehicle, setSearchedVehicle] = useState<RTOVehicle | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (plateToSearch?: string) => {
    const target = plateToSearch || regInput;
    if (!target.trim() || target.trim().length < 5) {
      setErrorMsg('Please enter a valid vehicle registration number (e.g. DL01AB1234)');
      return;
    }

    setErrorMsg('');
    setLoading(true);

    try {
      const data = await fetchRTOVehicle(target);
      if (data) {
        setSearchedVehicle(data);
        setRegInput(data.registration_number);
      } else {
        setErrorMsg('Vehicle details not found for this registration number.');
      }
    } catch {
      setErrorMsg('Failed to fetch RTO details. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (plate: string) => {
    setRegInput(plate);
    handleSearch(plate);
  };

  const handleProceedToSell = () => {
    if (searchedVehicle && onSellThisCar) {
      onSellThisCar(searchedVehicle);
    } else {
      // Smooth scroll to sell car section
      const el = document.getElementById('sell-car');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section id="rto-check" className={`section-padding border-t transition-colors duration-500 ${
      isDark ? 'bg-[#0a0a0e] border-white/8 text-white' : 'bg-slate-50/70 border-gray-200 text-gray-900'
    }`}>
      <div className="container-width max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold mb-3 border backdrop-blur-md bg-orange-500/10 border-orange-500/30 text-orange-500">
            <span className="text-base leading-none">🇮🇳</span>
            <span>Vahan Parivahan • National Vehicle Register</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-500">Online & Live</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-3">
            RTO Car Registration <span className="text-gradient">Instant Check</span>
          </h2>
          <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Enter any Indian vehicle registration number to instantly verify owner serial, registration date, fitness validity, insurance expiry, and estimated market resale value.
          </p>
        </motion.div>

        {/* Search Box Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl mb-10 transition-all ${
          isDark
            ? 'bg-gradient-to-b from-[#13141b] to-[#0e0f14] border-white/10 shadow-black/80'
            : 'bg-white border-gray-200 shadow-xl shadow-orange-500/5'
        }`}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex flex-col sm:flex-row gap-3 items-center mb-4"
          >
            {/* Number Plate Styled Input */}
            <div className="relative flex-1 w-full flex items-center rounded-2xl border overflow-hidden shadow-inner bg-black/5 dark:bg-white/5 border-orange-500/30 focus-within:border-orange-500 transition-all">
              {/* Left IND Blue Hologram Strip */}
              <div className="w-12 h-14 bg-blue-700 text-white flex flex-col items-center justify-center font-black text-[10px] leading-tight select-none border-r border-blue-600">
                <span className="text-xs">🇮🇳</span>
                <span className="tracking-widest mt-0.5">IND</span>
              </div>

              <input
                type="text"
                value={regInput}
                onChange={(e) => {
                  setRegInput(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="ENTER VEHICLE NO (e.g. DL01AB1234)"
                maxLength={13}
                className={`w-full py-3.5 px-4 text-base sm:text-lg font-black tracking-widest outline-none bg-transparent ${
                  isDark ? 'text-white placeholder:text-white/25' : 'text-gray-900 placeholder:text-gray-400'
                }`}
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Checking RTO...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Verify Vehicle</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Error notice */}
          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold mb-4 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Clickable Sample Plates */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
              Try Sample Vehicles:
            </span>
            {samplePlates.map((sample) => (
              <button
                key={sample.no}
                type="button"
                onClick={() => handleSelectSample(sample.no)}
                className={`text-xs px-3 py-1.5 rounded-xl font-bold border transition-all cursor-pointer ${
                  regInput === sample.no
                    ? 'bg-orange-500 text-white border-orange-500'
                    : isDark
                    ? 'bg-white/5 border-white/10 text-white/80 hover:bg-orange-500/10 hover:border-orange-500/40 hover:text-orange-400'
                    : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600'
                }`}
              >
                <span className="font-mono">{sample.no}</span>
                <span className={`text-[10px] ml-1.5 font-normal ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                  {sample.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Loading Progress State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`p-8 rounded-3xl border text-center ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <div className="w-12 h-12 rounded-full border-3 border-orange-500/20 border-t-orange-500 animate-spin mx-auto mb-4" />
            <h4 className="font-bold text-lg mb-1">Querying National Vahan Database...</h4>
            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
              Verifying registration details, active insurance status & vehicle ownership history
            </p>
          </motion.div>
        )}

        {/* Digital RC Card Results */}
        <AnimatePresence>
          {searchedVehicle && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className={`rounded-3xl border overflow-hidden shadow-2xl transition-all ${
                isDark
                  ? 'bg-[#111218] border-white/15 shadow-black/90'
                  : 'bg-white border-gray-200 shadow-2xl shadow-orange-500/10'
              }`}
            >
              {/* RC Card Header Banner */}
              <div className="p-6 sm:p-8 bg-gradient-to-r from-orange-500/15 via-transparent to-emerald-500/15 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* HSRP Plate Emblem */}
                  <div className="h-14 px-4 bg-white text-gray-900 border-2 border-gray-800 rounded-xl flex items-center gap-3 font-mono font-black text-xl shadow-md select-none">
                    <div className="flex flex-col items-center justify-center text-[9px] leading-tight text-blue-700 border-r border-gray-300 pr-2">
                      <span>🇮🇳</span>
                      <span>IND</span>
                    </div>
                    <span>{searchedVehicle.registration_number}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">
                        {searchedVehicle.maker}
                      </span>
                      <span className="text-emerald-500 text-xs font-bold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>RC Active & Verified</span>
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black mt-0.5">
                      {searchedVehicle.model} <span className="text-sm font-semibold opacity-80">{searchedVehicle.variant}</span>
                    </h3>
                  </div>
                </div>

                {/* Instant Market Valuation Badge */}
                <div className={`p-3.5 rounded-2xl border text-right ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-orange-50/80 border-orange-200'
                }`}>
                  <p className="text-[11px] uppercase tracking-wider font-bold text-orange-500">
                    Estimated Market Value
                  </p>
                  <p className="text-2xl font-black text-orange-500">
                    {formatPrice(searchedVehicle.estimated_market_value)}
                  </p>
                </div>
              </div>

              {/* RC Detailed Data Grid */}
              <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 1. Registration & Ownership */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">
                    <FileText className="w-4 h-4" />
                    <span>Registration & Ownership</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Owner Serial</span>
                      <span className="font-bold text-orange-400">{searchedVehicle.owner_serial}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Masked Name</span>
                      <span className="font-mono font-bold">{searchedVehicle.owner_name_masked}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Registration Date</span>
                      <span className="font-bold">{searchedVehicle.registration_date}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Manufacture Year</span>
                      <span className="font-bold">{searchedVehicle.manufacture_year}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Fitness Valid Upto</span>
                      <span className="font-bold text-emerald-500">{searchedVehicle.fitness_upto}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Technical Specs */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">
                    <CarIcon className="w-4 h-4" />
                    <span>Vehicle Specifications</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Fuel Type</span>
                      <span className="font-bold text-emerald-400">{searchedVehicle.fuel_type}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Transmission</span>
                      <span className="font-bold truncate max-w-[130px]">{searchedVehicle.transmission}</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Engine Capacity</span>
                      <span className="font-bold">{searchedVehicle.engine_capacity_cc} cc</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Emission Norm</span>
                      <span className="font-bold">{searchedVehicle.emission_norm}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Color</span>
                      <span className="font-bold">{searchedVehicle.color}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Insurance & Compliance */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase tracking-wider mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Insurance & RTO Location</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Registered RTO</span>
                      <span className="font-bold text-orange-400">{searchedVehicle.rto_code} ({searchedVehicle.state})</span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>RTO Office</span>
                      <span className="font-bold truncate max-w-[130px]" title={searchedVehicle.rto_office}>
                        {searchedVehicle.rto_office}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Insurance Company</span>
                      <span className="font-bold truncate max-w-[130px]" title={searchedVehicle.insurance_company}>
                        {searchedVehicle.insurance_company}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Insurance Expiry</span>
                      <span className="font-bold text-emerald-500">{searchedVehicle.insurance_expiry}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={isDark ? 'text-white/50' : 'text-gray-500'}>Bank Hypothecation</span>
                      <span className="font-bold">
                        {searchedVehicle.hypothecated ? (
                          <span className="text-amber-400 font-semibold">{searchedVehicle.financier || 'Financed'}</span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">Clean Title (No Loan)</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Call to Action: Auto-Populate into Sell Car Flow */}
              <div className="p-6 sm:p-8 border-t border-white/10 bg-gradient-to-r from-orange-500/10 to-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-black text-lg">Looking to sell your {searchedVehicle.maker} {searchedVehicle.model}?</h4>
                  <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    All verified details will automatically be fetched to give you an instant valuation with doorstep payment!
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <motion.button
                    type="button"
                    onClick={handleProceedToSell}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25 cursor-pointer whitespace-nowrap"
                  >
                    <SteeringWheelIcon className="w-4 h-4" />
                    <span>Sell With Auto-Fetched Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
