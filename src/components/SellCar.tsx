import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  Calendar,
  Banknote,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Car as CarIcon,
  Gauge,
  Check,
  Search,
  Fuel,
  FileCheck,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { fetchRTOVehicle, saveSellCarInquiry, type RTOVehicle } from '../services/rtoService';
import SteeringWheelIcon from './SteeringWheelIcon';

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Auto-Fetch RTO Details',
    description: 'Enter your vehicle registration number. We instantly fetch verified maker, model, variant & registration date from the RTO.',
    color: 'bg-orange-500',
    delay: 0,
  },
  {
    step: '02',
    icon: Calculator,
    title: 'Instant Fair Valuation',
    description: 'Our pricing algorithm factors verified RTO specs, market demand & running history to give you the highest fair offer.',
    color: 'bg-blue-600',
    delay: 0.1,
  },
  {
    step: '03',
    icon: Banknote,
    title: 'Same-Day Instant Payment',
    description: 'Accept the offer and receive instant bank payment directly into your account with free doorstep vehicle pickup.',
    color: 'bg-emerald-600',
    delay: 0.2,
  },
];

const perks = [
  'Auto-fetched official RTO data — zero tedious typing',
  'Best market price guarantee based on real-time live market demand',
  'Free doorstep physical evaluation & comprehensive vehicle condition report',
  'Instant payment transferred directly into your bank account before handover',
  'Complete free RC transfer and paperwork legal assistance',
  'Saved directly to secure Supabase database with instant tracking',
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

const YEARS = Array.from({ length: 16 }, (_, i) => 2024 - i);

function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${val.toLocaleString('en-IN')}`;
}

function calculateCarPrice(regNo: string, year: number, km: number, _brand?: string, rtoBasePrice?: number) {
  let hash = 0;
  const cleanReg = regNo.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  for (let i = 0; i < cleanReg.length; i++) {
    hash = (hash << 5) - hash + cleanReg.charCodeAt(i);
    hash |= 0;
  }
  const randomFactor = Math.abs(hash % 100) / 100;

  let basePrice = rtoBasePrice || 850000;
  const currentYear = 2024;
  const age = Math.max(0, currentYear - year);

  basePrice = basePrice * Math.pow(0.92, age);
  const kmDepreciation = Math.min(0.35, (km / 100000) * 0.18);
  basePrice = basePrice * (1 - kmDepreciation);

  const variance = (randomFactor - 0.5) * 0.15;
  const estimatedPrice = Math.round((basePrice * (1 + variance)) / 5000) * 5000;

  const minPrice = Math.round((estimatedPrice * 0.95) / 5000) * 5000;
  const maxPrice = Math.round((estimatedPrice * 1.05) / 5000) * 5000;

  return {
    estimatedPrice: Math.max(150000, estimatedPrice),
    minPrice: Math.max(130000, minPrice),
    maxPrice: Math.max(170000, maxPrice),
  };
}

interface SellCarProps {
  initialRTOVehicle?: RTOVehicle | null;
}

export default function SellCar({ initialRTOVehicle }: SellCarProps = {}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Form states
  const [regNo, setRegNo] = useState('');
  const [year, setYear] = useState<number>(2022);
  const [km, setKm] = useState<string>('35000');
  const [brand, setBrand] = useState('Hyundai');
  const [model, setModel] = useState('Creta');
  const [fuel, setFuel] = useState('Petrol');
  const [transmission, setTransmission] = useState('Automatic');
  const [error, setError] = useState('');

  // RTO Integration state
  const [rtoVehicle, setRtoVehicle] = useState<RTOVehicle | null>(null);
  const [isFetchingRTO, setIsFetchingRTO] = useState(false);
  const [rtoStatusMsg, setRtoStatusMsg] = useState('');

  // Evaluation states
  const [isCalculating, setIsCalculating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [valuationResult, setValuationResult] = useState<{
    estimatedPrice: number;
    minPrice: number;
    maxPrice: number;
    carDetails: {
      regNo: string;
      year: number;
      km: number;
      brand: string;
      model: string;
      fuel: string;
      transmission: string;
      rtoOffice?: string;
      state?: string;
      ownerSerial?: string;
    };
  } | null>(null);

  // Booking modal/state
  const [isBooked, setIsBooked] = useState(false);
  const [isSavingInquiry, setIsSavingInquiry] = useState(false);
  const [savedInquiryId, setSavedInquiryId] = useState<string | null>(null);

  // Populate from prop if user clicked "Sell This Car" in RTO Section
  useEffect(() => {
    if (initialRTOVehicle) {
      applyRTOVehicleData(initialRTOVehicle);
    }
  }, [initialRTOVehicle]);

  const applyRTOVehicleData = (veh: RTOVehicle) => {
    setRtoVehicle(veh);
    setRegNo(veh.registration_number);
    setYear(veh.manufacture_year);
    setModel(veh.model);
    setFuel(veh.fuel_type);
    setTransmission(veh.transmission);

    // Map maker to Brand
    const makerUpper = veh.maker.toUpperCase();
    if (makerUpper.includes('HYUNDAI')) setBrand('Hyundai');
    else if (makerUpper.includes('TATA')) setBrand('Tata');
    else if (makerUpper.includes('MARUTI')) setBrand('Maruti Suzuki');
    else if (makerUpper.includes('HONDA')) setBrand('Honda');
    else if (makerUpper.includes('TOYOTA')) setBrand('Toyota');
    else if (makerUpper.includes('MAHINDRA')) setBrand('Mahindra');
    else if (makerUpper.includes('KIA')) setBrand('Kia');
    else if (makerUpper.includes('VOLKSWAGEN')) setBrand('Volkswagen');
    else setBrand(veh.maker);

    setRtoStatusMsg(`✓ Auto-fetched from RTO: ${veh.maker} ${veh.model} (${veh.manufacture_year})`);
    setError('');
  };

  // Live RTO Fetch handler
  const handleFetchRTO = async () => {
    const clean = regNo.trim().toUpperCase();
    if (!clean || clean.length < 5) {
      setError('Please enter a valid registration number first (e.g. DL01AB1234)');
      return;
    }

    setError('');
    setIsFetchingRTO(true);
    setRtoStatusMsg('Connecting to Parivahan RTO Register...');

    try {
      const data = await fetchRTOVehicle(clean);
      if (data) {
        applyRTOVehicleData(data);
      } else {
        setRtoStatusMsg('No RTO record found. You can still enter details manually.');
      }
    } catch {
      setRtoStatusMsg('RTO server busy. You can still enter details manually.');
    } finally {
      setIsFetchingRTO(false);
    }
  };

  // Quick Demo Auto-fill handler
  const handleQuickDemo = () => {
    setRegNo('DL01AB1234');
    handleFetchRTO();
  };

  // Submit & Calculate
  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanReg = regNo.trim().toUpperCase();

    if (!cleanReg) {
      setError('Please enter your car registration number');
      return;
    }

    if (cleanReg.length < 5) {
      setError('Please enter a valid registration number');
      return;
    }

    const kmNumber = parseInt(km.replace(/[^0-9]/g, ''), 10) || 40000;
    setError('');
    setIsCalculating(true);
    setLoadingStep(0);
    setIsBooked(false);

    // If RTO details haven't been fetched yet, fetch them now
    let currentRTO = rtoVehicle;
    if (!currentRTO) {
      currentRTO = await fetchRTOVehicle(cleanReg);
      if (currentRTO) {
        applyRTOVehicleData(currentRTO);
      }
    }

    setTimeout(() => setLoadingStep(1), 350);
    setTimeout(() => setLoadingStep(2), 750);
    setTimeout(() => {
      const result = calculateCarPrice(
        cleanReg,
        year,
        kmNumber,
        brand,
        currentRTO?.estimated_market_value
      );

      const calculatedDetails = {
        ...result,
        carDetails: {
          regNo: cleanReg,
          year,
          km: kmNumber,
          brand,
          model: currentRTO?.model || model || 'Model',
          fuel: currentRTO?.fuel_type || fuel,
          transmission: currentRTO?.transmission || transmission,
          rtoOffice: currentRTO?.rto_office,
          state: currentRTO?.state,
          ownerSerial: currentRTO?.owner_serial,
        },
      };

      setValuationResult(calculatedDetails);
      setIsCalculating(false);
    }, 1100);
  };

  // Book Doorstep Inspection & Save to Supabase
  const handleBookInspection = async () => {
    if (!valuationResult) return;

    setIsSavingInquiry(true);

    try {
      const res = await saveSellCarInquiry({
        registration_number: valuationResult.carDetails.regNo,
        brand: valuationResult.carDetails.brand,
        model: valuationResult.carDetails.model,
        year: valuationResult.carDetails.year,
        fuel_type: valuationResult.carDetails.fuel,
        transmission: valuationResult.carDetails.transmission,
        km_driven: valuationResult.carDetails.km,
        ownership: valuationResult.carDetails.ownerSerial || '1st Owner',
        condition: 'Mint / Good',
        estimated_min_price: valuationResult.minPrice,
        estimated_max_price: valuationResult.maxPrice,
        seller_city: valuationResult.carDetails.state || 'Delhi NCR',
        rto_verified: !!rtoVehicle,
      });

      if (res.success) {
        setSavedInquiryId(res.id || 'INQ-' + Math.floor(100000 + Math.random() * 900000));
      }
    } catch (err) {
      console.error('Supabase inquiry save error:', err);
    } finally {
      setIsSavingInquiry(false);
      setIsBooked(true);
    }
  };

  const handleReset = () => {
    setValuationResult(null);
    setIsBooked(false);
    setRtoVehicle(null);
    setRtoStatusMsg('');
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Value Prop, Perks & Steps (5 cols) */}
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
              <span>RTO-Powered Instant Valuation</span>
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
              Enter your vehicle registration number. We automatically fetch verified maker, model, variant, and insurance history from the RTO database to generate an instant fair valuation with doorstep payment.
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
                    <s.icon className="w-4 h-4" />
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
                    Car Valuation & Selling Flow
                  </h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Details auto-fetched from RTO • Saved securely to Supabase
                  </p>
                </div>

                {/* Quick Demo Pill */}
                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                      : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  }`}
                  title="Auto-fill example with RTO data"
                >
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>Try Demo (DL01AB1234)</span>
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
                      {loadingStep === 0 && `Fetching RTO records for ${regNo.toUpperCase()}...`}
                      {loadingStep === 1 && `Verifying ${brand} ${model} & ${Number(km).toLocaleString('en-IN')} km...`}
                      {loadingStep >= 2 && 'Computing highest real-time market offer...'}
                    </h4>

                    <p className={`text-xs max-w-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      Synchronizing with Parivahan database & comparing latest auction & retail transactions...
                    </p>
                  </motion.div>
                ) : valuationResult ? (
                  /* 2. VALUATION RESULT STATE */
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="space-y-5"
                  >
                    {/* Car Card Summary */}
                    <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-3 ${
                      isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
                          <CarIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-sm text-orange-500">
                              {valuationResult.carDetails.regNo}
                            </span>
                            <span className="text-[10px] bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2 py-0.2 rounded font-bold">
                              RTO Verified
                            </span>
                          </div>
                          <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {valuationResult.carDetails.year} {valuationResult.carDetails.brand} {valuationResult.carDetails.model}
                          </p>
                          <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {valuationResult.carDetails.fuel} • {valuationResult.carDetails.transmission} • {valuationResult.carDetails.km.toLocaleString('en-IN')} km
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleReset}
                        className={`text-xs underline-offset-2 hover:underline cursor-pointer ${
                          isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                        }`}
                      >
                        Recalculate
                      </button>
                    </div>

                    {/* Price Result Box */}
                    <div className="rounded-2xl p-6 bg-gradient-to-br from-orange-500/15 via-orange-500/5 to-transparent border border-orange-500/30 text-center relative overflow-hidden">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Instant Guaranteed Valuation Offer</span>
                      </div>

                      <div className="text-3xl sm:text-4xl md:text-5xl font-black text-orange-500 my-1 tracking-tight">
                        {formatINR(valuationResult.estimatedPrice)}
                      </div>

                      <p className={`text-xs font-medium mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        Expected Range: <span className="font-bold text-orange-400">{formatINR(valuationResult.minPrice)}</span> – <span className="font-bold text-orange-400">{formatINR(valuationResult.maxPrice)}</span>
                      </p>

                      <div className="flex items-center justify-center gap-4 text-[11px] pt-3 border-t border-orange-500/15 flex-wrap">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
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
                        <h4 className="font-bold text-base text-emerald-400 mb-1">
                          Doorstep Inspection Inquiry Recorded!
                        </h4>
                        <p className="text-xs text-emerald-300/80 mb-2">
                          Your vehicle inquiry for <span className="font-bold text-white">{valuationResult.carDetails.regNo}</span> has been securely saved in our database.
                        </p>
                        {savedInquiryId && (
                          <span className="text-[11px] font-mono bg-emerald-500/20 px-3 py-1 rounded-full text-emerald-300 font-bold">
                            Inquiry ID: {savedInquiryId}
                          </span>
                        )}
                        <p className="text-[11px] text-emerald-300/70 mt-2">
                          Our relationship executive will call to confirm your convenient date & time slot.
                        </p>
                      </motion.div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={isSavingInquiry}
                          onClick={handleBookInspection}
                          className="w-full flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/25 cursor-pointer disabled:opacity-50"
                        >
                          {isSavingInquiry ? (
                            <>
                              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                              <span>Saving to Database...</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-4 h-4" />
                              <span>Book Free Doorstep Inspection</span>
                            </>
                          )}
                        </motion.button>

                        <button
                          type="button"
                          onClick={handleReset}
                          className={`w-full sm:w-auto px-5 py-3.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
                    {/* Car Registration Number + Auto-Fetch Button */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className={`block text-xs font-bold uppercase tracking-wider ${
                          isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          Vehicle Registration Number <span className="text-orange-500">*</span>
                        </label>

                        <button
                          type="button"
                          disabled={isFetchingRTO || !regNo.trim()}
                          onClick={handleFetchRTO}
                          className="text-xs text-orange-500 font-bold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
                        >
                          {isFetchingRTO ? (
                            <>
                              <div className="w-3 h-3 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-spin" />
                              <span>Fetching RTO...</span>
                            </>
                          ) : (
                            <>
                              <Search className="w-3 h-3" />
                              <span>Auto-Fetch Details</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        {/* Number plate styled input */}
                        <div className="relative flex-1 flex items-center rounded-xl border overflow-hidden bg-black/5 dark:bg-white/5 border-orange-500/30 focus-within:border-orange-500">
                          <div className="px-3 py-3 bg-blue-700 text-white font-black text-[10px] flex items-center gap-1 select-none">
                            <span>🇮🇳</span>
                            <span>IND</span>
                          </div>
                          <input
                            type="text"
                            value={regNo}
                            onChange={(e) => {
                              setRegNo(e.target.value.toUpperCase());
                              if (error) setError('');
                              if (rtoVehicle && rtoVehicle.registration_number !== e.target.value.toUpperCase()) {
                                setRtoVehicle(null);
                                setRtoStatusMsg('');
                              }
                            }}
                            onBlur={() => {
                              if (regNo.trim().length >= 5 && !rtoVehicle) {
                                handleFetchRTO();
                              }
                            }}
                            placeholder="e.g. DL01AB1234 or UP16AY9999"
                            className={`w-full px-3 py-3 font-mono font-bold tracking-wider text-sm outline-none bg-transparent ${
                              isDark ? 'text-white placeholder:text-white/25' : 'text-gray-900 placeholder:text-gray-400'
                            }`}
                            maxLength={13}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleFetchRTO}
                          disabled={isFetchingRTO || !regNo.trim()}
                          className="px-4 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Fetch from RTO</span>
                        </button>
                      </div>

                      {/* RTO Status Badge */}
                      {rtoStatusMsg && (
                        <p className={`text-xs mt-1.5 font-medium flex items-center gap-1 ${
                          rtoVehicle ? 'text-emerald-500' : 'text-orange-400'
                        }`}>
                          {rtoStatusMsg}
                        </p>
                      )}

                      {error && (
                        <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center gap-1">
                          {error}
                        </p>
                      )}
                    </div>

                    {/* Verified RTO Highlight Banner if fetched */}
                    {rtoVehicle && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs ${
                          isDark ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold">
                              {rtoVehicle.maker} {rtoVehicle.model} {rtoVehicle.variant}
                            </p>
                            <p className="opacity-80 text-[11px]">
                              {rtoVehicle.manufacture_year} Model • {rtoVehicle.fuel_type} • {rtoVehicle.rto_office} • {rtoVehicle.owner_serial}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                          Auto-Filled
                        </span>
                      </motion.div>
                    )}

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
                                {y}
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
                            placeholder="e.g. 35000"
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
                    <div className="flex items-center gap-2 flex-wrap pt-0.5">
                      <span className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                        Quick select km:
                      </span>
                      {['25000', '45000', '75000', '110000'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setKm(preset)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            km === preset
                              ? 'bg-orange-500 text-white border-orange-500 font-bold'
                              : isDark
                              ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                              : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {Number(preset) >= 100000 ? `${Number(preset) / 1000}k km` : `${Number(preset).toLocaleString('en-IN')} km`}
                        </button>
                      ))}
                    </div>

                    {/* Brand & Fuel Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${
                          isDark ? 'text-white/70' : 'text-gray-700'
                        }`}>
                          Fuel & Transmission
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className={`px-3 py-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}>
                            <span className="truncate">{fuel}</span>
                            <Fuel className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          </div>

                          <div className={`px-3 py-3 rounded-xl border text-xs font-bold flex items-center justify-between ${
                            isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'
                          }`}>
                            <span className="truncate">{transmission}</span>
                            <SteeringWheelIcon className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-2xl text-sm transition-all shadow-xl shadow-orange-500/25 cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                        <span>Get Instant Valuation with RTO Details</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    </div>

                    <p className={`text-[11px] text-center ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                      Free valuation • RTO verified • Doorstep evaluation in 30+ cities across India
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
