import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Calendar,
  Banknote,
  ArrowRight,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Car as CarIcon,
  Gauge,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const steps = [
  {
    step: '01',
    icon: Calculator,
    title: 'Instant Online Valuation',
    description: 'Share your vehicle details and receive an instant fair market price quote in under 60 seconds.',
    color: 'bg-orange-500',
    delay: 0,
  },
  {
    step: '02',
    icon: Calendar,
    title: 'Free Doorstep Inspection',
    description: 'Book a certified engineer visit at your home or workplace at your preferred date and convenient time slot.',
    color: 'bg-blue-600',
    delay: 0.1,
  },
  {
    step: '03',
    icon: Banknote,
    title: 'Same-Day Instant Payment',
    description: 'Accept the offer and receive instant bank payment directly into your account before the car leaves your driveway.',
    color: 'bg-emerald-600',
    delay: 0.2,
  },
];

const perks = [
  'Best market price guarantee based on real-time live market demand',
  'Free doorstep physical evaluation & comprehensive vehicle condition report',
  'Instant payment transferred directly into your bank account',
  'Complete free RC transfer and paperwork legal assistance',
  'Zero listing charges, zero platform commission',
];

const POPULAR_BRANDS = [
  'Maruti Suzuki',
  'Hyundai',
  'Tata',
  'Honda',
  'Toyota',
  'Mahindra',
  'Kia',
  'Volkswagen',
  'Other',
];

const YEARS = Array.from({ length: 16 }, (_, i) => 2024 - i); // 2024 down to 2009

// Format price in Indian Rupee format (Lakhs / Thousands)
function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

/**
 * Generates an estimated price valuation based on:
 * - Car Reg No (seeded randomness for consistency)
 * - Model Year (newer = higher value)
 * - KM driven (depreciation curve)
 * 
 * NOTE: You can easily customize or connect this to your backend pricing API later.
 */
function calculateCarPrice(regNo: string, year: number, km: number, _brand?: string) {
  // Simple deterministic hash of the registration number to keep random numbers consistent
  let hash = 0;
  const cleanReg = regNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  for (let i = 0; i < cleanReg.length; i++) {
    hash = (hash << 5) - hash + cleanReg.charCodeAt(i);
    hash |= 0;
  }
  const randomFactor = Math.abs(hash % 100) / 100; // 0.00 to 0.99

  // Base price anchored to year
  const currentYear = 2024;
  const age = Math.max(0, currentYear - year);
  
  // Starting base value for a typical 2018 car ~ 5.5 - 6.5 Lakhs
  let basePrice = 650000;
  
  // Age depreciation ~ 8% per year
  basePrice = basePrice * Math.pow(0.91, age);

  // Mileage depreciation curve
  // Standard running is ~12,000 km/year. Above that depreciates slightly more.
  const kmDepreciation = Math.min(0.40, (km / 100000) * 0.22);
  basePrice = basePrice * (1 - kmDepreciation);

  // Add random variance (+/- 15%) so each car gets an authentic dynamic quote
  const variance = (randomFactor - 0.5) * 0.30;
  const estimatedPrice = Math.round((basePrice * (1 + variance)) / 5000) * 5000;

  // Price range bracket (+/- 6%)
  const minPrice = Math.round((estimatedPrice * 0.94) / 5000) * 5000;
  const maxPrice = Math.round((estimatedPrice * 1.06) / 5000) * 5000;

  return {
    estimatedPrice: Math.max(120000, estimatedPrice),
    minPrice: Math.max(100000, minPrice),
    maxPrice: Math.max(140000, maxPrice),
  };
}

export default function SellCar() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form states
  const [regNo, setRegNo] = useState('');
  const [year, setYear] = useState<number>(2018);
  const [km, setKm] = useState<string>('100000');
  const [brand, setBrand] = useState('Hyundai');
  const [error, setError] = useState('');

  // Evaluation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [valuationResult, setValuationResult] = useState<{
    estimatedPrice: number;
    minPrice: number;
    maxPrice: number;
    carDetails: { regNo: string; year: number; km: number; brand: string };
  } | null>(null);

  // Booking modal/state
  const [isBooked, setIsBooked] = useState(false);

  // Quick Demo Auto-fill handler
  const handleQuickDemo = () => {
    setRegNo('UP19E4449');
    setYear(2018);
    setKm('100000');
    setBrand('Hyundai');
    setError('');
  };

  // Submit & Calculate
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReg = regNo.trim().toUpperCase();

    if (!cleanReg) {
      setError('Please enter your car registration number (e.g. UP19E4449)');
      return;
    }

    if (cleanReg.length < 5) {
      setError('Please enter a valid registration number');
      return;
    }

    const kmNumber = parseInt(km.replace(/[^0-9]/g, ''), 10) || 50000;
    setError('');
    setIsCalculating(true);
    setLoadingStep(0);
    setIsBooked(false);

    // Simulate 3-stage live AI market valuation lookup
    setTimeout(() => setLoadingStep(1), 400);
    setTimeout(() => setLoadingStep(2), 900);
    setTimeout(() => {
      const result = calculateCarPrice(cleanReg, year, kmNumber, brand);
      setValuationResult({
        ...result,
        carDetails: {
          regNo: cleanReg,
          year,
          km: kmNumber,
          brand,
        },
      });
      setIsCalculating(false);
    }, 1400);
  };

  const handleReset = () => {
    setValuationResult(null);
    setIsBooked(false);
  };

  return (
    <section
      id="sell-car"
      className={`section-padding relative overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#090a0d] text-white' : 'bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900'
      }`}
    >
      {/* Background ambient lighting */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity ${
          isDark
            ? 'bg-gradient-to-br from-orange-950/20 via-transparent to-transparent opacity-100'
            : 'opacity-0'
        }`}
      />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle, #ff5b00 0%, transparent 70%)`,
        }}
      />

      <div className="container-width relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Information & Selling Benefits (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-5"
          >
            <div className={`inline-flex items-center gap-2 border text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 backdrop-blur-md transition-colors ${
              isDark
                ? 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                : 'bg-orange-50 border-orange-200 text-orange-600'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>Instant AI Valuation Engine</span>
            </div>

            <h2
              className={`text-3xl sm:text-4xl font-black mb-3 leading-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Sell your car at the <span className="text-gradient">best price</span>
            </h2>
            <p
              className={`text-sm mb-6 leading-relaxed ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}
            >
              Enter your vehicle number and running history to get a real-time instant valuation offer with doorstep inspection & same-day payment.
            </p>

            {/* Perks List */}
            <ul className="space-y-2.5 mb-8">
              {perks.map((perk) => (
                <li
                  key={perk}
                  className={`flex items-start gap-3 text-xs sm:text-sm ${
                    isDark ? 'text-white/75' : 'text-gray-700'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <span>{perk}</span>
                </li>
              ))}
            </ul>

            {/* 3 Step Timeline */}
            <div className="space-y-3.5 border-t pt-6 border-white/10">
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                How It Works
              </h3>
              {steps.map((s) => (
                <div key={s.step} className="flex items-start gap-3.5 group">
                  <div className={`w-8 h-8 ${s.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0 text-white text-xs font-black`}>
                    {s.step}
                  </div>
                  <div>
                    <h4 className={`font-bold text-xs sm:text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {s.title}
                    </h4>
                    <p className={`text-[11px] sm:text-xs leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Interactive Sell Calculator Card (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7"
          >
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all ${
                isDark
                  ? 'bg-[#111217]/95 border-white/10 shadow-black/80'
                  : 'bg-white border-gray-200 shadow-xl shadow-orange-500/5'
              }`}
            >
              {/* Decorative corner glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
                <div>
                  <h3 className={`text-xl sm:text-2xl font-black ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Instant Car Valuation Calculator
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Enter your car number and km running to get instant estimated offer
                  </p>
                </div>

                {/* Quick Demo Pill */}
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                    isDark
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                      : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  }`}
                  title="Auto-fill example: UP19E4449, 2018, 100k km"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>Try Demo (UP19E4449)</span>
                </button>
              </div>

              {/* Animate between Form, Calculating Loader, and Result */}
              <AnimatePresence mode="wait">
                {/* 1. CALCULATING ANIMATION STATE */}
                {isCalculating ? (
                  <motion.div
                    key="calculating"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-12 flex flex-col items-center justify-center text-center"
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin flex items-center justify-center" />
                      <CarIcon className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>

                    <h4 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {loadingStep === 0 && `Analyzing RTO details for ${regNo.toUpperCase()}...`}
                      {loadingStep === 1 && `Factoring ${year} model & ${Number(km).toLocaleString('en-IN')} km running...`}
                      {loadingStep >= 2 && 'Calculating live fair market price...'}
                    </h4>

                    <p className={`text-xs max-w-sm ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                      Evaluating real-time dealer auctions, city demand, and condition metrics...
                    </p>

                    <div className="w-48 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full mt-6 overflow-hidden">
                      <motion.div
                        className="h-full bg-orange-500 rounded-full"
                        initial={{ width: '15%' }}
                        animate={{ width: loadingStep === 0 ? '35%' : loadingStep === 1 ? '75%' : '100%' }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </motion.div>
                ) : valuationResult ? (
                  /* 2. VALUATION RESULT DISPLAY */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                  >
                    {/* Confirmed Car Badge Banner */}
                    <div
                      className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                        isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Simulated License Plate */}
                        <div className="flex items-center border-2 border-yellow-500/80 bg-white text-gray-900 rounded-md font-mono text-xs font-black tracking-wider px-2.5 py-1 shadow-sm">
                          <span className="text-[9px] bg-blue-700 text-white px-1 py-0.5 rounded mr-1.5 font-sans font-bold">
                            IND
                          </span>
                          {valuationResult.carDetails.regNo}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {valuationResult.carDetails.brand} ({valuationResult.carDetails.year} Model)
                          </p>
                          <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {valuationResult.carDetails.km.toLocaleString('en-IN')} km driven
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleReset}
                        className={`text-xs flex items-center gap-1 font-semibold transition-colors ${
                          isDark ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Edit Details</span>
                      </button>
                    </div>

                    {/* Price Card Highlight */}
                    <div
                      className={`p-6 rounded-2xl border text-center relative overflow-hidden ${
                        isDark
                          ? 'bg-gradient-to-b from-orange-500/10 via-[#16171d] to-[#121318] border-orange-500/30'
                          : 'bg-gradient-to-b from-orange-50 via-white to-orange-50/30 border-orange-200 shadow-lg shadow-orange-500/10'
                      }`}
                    >
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-500 uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Estimated Fair Market Offer</span>
                      </div>

                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-500 my-1 tracking-tight">
                        {formatINR(valuationResult.estimatedPrice)}
                      </div>

                      <p className={`text-xs font-medium mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        Expected Price Range: <span className="font-bold text-orange-400">{formatINR(valuationResult.minPrice)}</span> – <span className="font-bold text-orange-400">{formatINR(valuationResult.maxPrice)}</span>
                      </p>

                      <div className="flex items-center justify-center gap-4 text-[11px] pt-3 border-t border-orange-500/15 flex-wrap">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          Price Valid for 7 Days
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Free Doorstep Pickup
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
                          Instant Account Transfer
                        </span>
                      </div>
                    </div>

                    {/* Booking Confirmation / CTA */}
                    {isBooked ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-center"
                      >
                        <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                        <h4 className="font-bold text-sm text-emerald-400 mb-1">
                          Free Doorstep Inspection Booked!
                        </h4>
                        <p className="text-xs text-emerald-300/80">
                          Our certified valuation inspector will contact you to confirm your convenient date & time slot for {valuationResult.carDetails.regNo}.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setIsBooked(true)}
                          className="w-full flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Book Free Doorstep Inspection</span>
                        </motion.button>

                        <button
                          type="button"
                          onClick={handleReset}
                          className={`w-full sm:w-auto px-5 py-3.5 rounded-xl border text-xs font-semibold transition-all ${
                            isDark
                              ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                              : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          Check Another Car
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  /* 3. INPUT FORM */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleCalculate}
                    className="space-y-4"
                  >
                    {/* Car Registration Number (with Indian Number Plate aesthetic) */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-white/70' : 'text-gray-700'
                      }`}>
                        Car Registration Number <span className="text-orange-500">*</span>
                      </label>
                      <div className="relative">
                        {/* IND Badge prefix */}
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded">
                          <span>IND</span>
                        </div>
                        <input
                          type="text"
                          value={regNo}
                          onChange={(e) => {
                            setRegNo(e.target.value.toUpperCase());
                            if (error) setError('');
                          }}
                          placeholder="e.g. UP19E4449 or DL01AB1234"
                          className={`w-full pl-16 pr-4 py-3 rounded-xl border font-mono font-bold tracking-wider text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            isDark
                              ? 'bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-orange-500'
                              : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500'
                          }`}
                          maxLength={12}
                        />
                      </div>
                      {error && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Model Year & Kilometers Running */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Manufacturing / Reg Year */}
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          Registration Year <span className="text-orange-500">*</span>
                        </label>
                        <div className="relative">
                          <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              isDark
                                ? 'bg-[#181920] border-white/15 text-white focus:border-orange-500'
                                : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'
                            }`}
                          >
                            {YEARS.map((y) => (
                              <option key={y} value={y} className={isDark ? 'bg-[#181920] text-white' : 'bg-white text-gray-900'}>
                                {y} {y === 2018 ? '(e.g. 2018 Model)' : ''}
                              </option>
                            ))}
                          </select>
                          <Calendar className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? 'text-white/40' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>

                      {/* Kilometers Running / Driven */}
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          Kilometers Running <span className="text-orange-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={km}
                            onChange={(e) => setKm(e.target.value.replace(/[^0-9]/g, ''))}
                            placeholder="e.g. 100000"
                            className={`w-full pl-10 pr-12 py-3 rounded-xl border font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                              isDark
                                ? 'bg-white/5 border-white/15 text-white placeholder:text-white/25 focus:border-orange-500'
                                : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-orange-500'
                            }`}
                          />
                          <Gauge className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                            isDark ? 'text-white/40' : 'text-gray-400'
                          }`} />
                          <span className={`absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold ${
                            isDark ? 'text-white/40' : 'text-gray-400'
                          }`}>
                            km
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick KM running pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                        Quick select km:
                      </span>
                      {['30000', '60000', '100000', '140000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setKm(preset)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                            km === preset
                              ? 'bg-orange-500 text-white border-orange-500'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                              : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {Number(preset) >= 100000 ? `${Number(preset) / 1000}k km` : `${Number(preset).toLocaleString('en-IN')} km`}
                        </button>
                      ))}
                    </div>

                    {/* Brand Selector */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                        isDark ? 'text-white/70' : 'text-gray-700'
                      }`}>
                        Car Brand
                      </label>
                      <div className="relative">
                        <select
                          value={brand}
                          onChange={(e) => setBrand(e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                            isDark
                              ? 'bg-[#181920] border-white/15 text-white focus:border-orange-500'
                              : 'bg-white border-gray-200 text-gray-900 focus:border-orange-500'
                          }`}
                        >
                          {POPULAR_BRANDS.map((b) => (
                            <option key={b} value={b} className={isDark ? 'bg-[#181920] text-white' : 'bg-white text-gray-900'}>
                              {b}
                            </option>
                          ))}
                        </select>
                        <CarIcon className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                          isDark ? 'text-white/40' : 'text-gray-400'
                        }`} />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/25"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Get Instant Valuation Offer</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <p className={`text-[11px] text-center ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      Free valuation • Zero obligation • Doorstep inspection available in 30+ cities
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}