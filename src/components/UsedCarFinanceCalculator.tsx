import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Sparkles,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Info,
  Car as CarIcon,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { featuredCars, popularCars } from '../data/mockData';
import type { Car } from '../types';

interface UsedCarFinanceCalculatorProps {
  onBookTestDrive?: (car?: Car) => void;
}

const allCars = [...featuredCars, ...popularCars];

// Formatting helper for Indian Rupee
function formatINR(val: number): string {
  if (val >= 10000000) {
    return `₹${(val / 10000000).toFixed(2)} Cr`;
  }
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  }
  return `₹${Math.round(val).toLocaleString('en-IN')}`;
}

const BANK_PARTNERS = [
  { name: 'HDFC Bank', rate: '8.95%*', badge: 'Preferred Partner' },
  { name: 'ICICI Bank', rate: '9.15%*', badge: 'Fast Approval' },
  { name: 'State Bank of India', rate: '8.75%*', badge: 'Lowest Rate' },
  { name: 'Axis Bank', rate: '9.25%*', badge: 'Zero Paperwork' },
  { name: 'Kotak Mahindra', rate: '9.35%*', badge: 'Instant Disbursal' },
  { name: 'IDFC FIRST Bank', rate: '9.45%*', badge: 'Flexible Tenure' },
];

export default function UsedCarFinanceCalculator({ onBookTestDrive }: UsedCarFinanceCalculatorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculator Inputs
  const [carPrice, setCarPrice] = useState<number>(1200000); // 12 Lakhs default
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20%
  const [tenureMonths, setTenureMonths] = useState<number>(60); // 5 years
  const [interestRate, setInterestRate] = useState<number>(10.5); // 10.5% p.a.
  const [selectedInventoryCarId, setSelectedInventoryCarId] = useState<string>('');

  // UI state
  const [showAmortization, setShowAmortization] = useState(false);
  const [eligibilityIncome, setEligibilityIncome] = useState<string>('75000');
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);

  // Sync with inventory car selection
  const handleCarSelect = (idStr: string) => {
    setSelectedInventoryCarId(idStr);
    if (!idStr) return;
    const found = allCars.find((c) => c.id === Number(idStr));
    if (found) {
      setCarPrice(found.price);
    }
  };

  // Financial Calculations
  const calculations = useMemo(() => {
    const downPaymentAmount = Math.round((carPrice * downPaymentPercent) / 100);
    const principal = Math.max(0, carPrice - downPaymentAmount);

    if (principal <= 0) {
      return {
        downPaymentAmount,
        principal: 0,
        monthlyEmi: 0,
        totalInterest: 0,
        totalAmount: downPaymentAmount,
        principalPercent: 100,
        interestPercent: 0,
        recommendedSalary: 0,
        yearlySchedule: [],
      };
    }

    const monthlyRate = interestRate / 12 / 100;
    const n = tenureMonths;

    // EMI Formula: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const factor = Math.pow(1 + monthlyRate, n);
    const monthlyEmi = Math.round((principal * monthlyRate * factor) / (factor - 1));
    const totalAmount = monthlyEmi * n;
    const totalInterest = Math.max(0, totalAmount - principal);

    const totalLoanCost = principal + totalInterest;
    const principalPercent = totalLoanCost > 0 ? Math.round((principal / totalLoanCost) * 100) : 100;
    const interestPercent = 100 - principalPercent;

    // Affordability: EMI should ideally be <= 40% of monthly net income
    const recommendedSalary = Math.round(monthlyEmi * 2.5);

    // Amortization Schedule (Year by Year)
    const years = Math.ceil(n / 12);
    let balance = principal;
    const yearlySchedule: Array<{
      year: number;
      principalPaid: number;
      interestPaid: number;
      endingBalance: number;
    }> = [];

    for (let y = 1; y <= years; y++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      for (let m = 1; m <= 12; m++) {
        if (balance <= 0) break;
        const interestForMonth = balance * monthlyRate;
        const principalForMonth = Math.min(balance, monthlyEmi - interestForMonth);
        yearlyInterest += interestForMonth;
        yearlyPrincipal += principalForMonth;
        balance -= principalForMonth;
      }
      yearlySchedule.push({
        year: y,
        principalPaid: Math.round(yearlyPrincipal),
        interestPaid: Math.round(yearlyInterest),
        endingBalance: Math.max(0, Math.round(balance)),
      });
    }

    return {
      downPaymentAmount,
      principal,
      monthlyEmi,
      totalInterest,
      totalAmount,
      principalPercent,
      interestPercent,
      recommendedSalary,
      yearlySchedule,
    };
  }, [carPrice, downPaymentPercent, tenureMonths, interestRate]);

  // Eligibility calculation based on entered income
  const eligibleLoanLimit = useMemo(() => {
    const income = Number(eligibilityIncome) || 0;
    // 45% max EMI allowed on income, amortized over 5 years at current rate
    const maxAffordableEmi = income * 0.45;
    const monthlyRate = interestRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, 60);
    const maxLoan = Math.round((maxAffordableEmi * (factor - 1)) / (monthlyRate * factor));
    return Math.max(0, maxLoan);
  }, [eligibilityIncome, interestRate]);

  // SVG Donut calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const principalStroke = (calculations.principalPercent / 100) * circumference;
  const interestStroke = circumference - principalStroke;

  return (
    <section
      id="emi-calculator"
      className={`section-padding relative overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#08090d] text-white' : 'bg-gradient-to-b from-white via-slate-50 to-white text-gray-900'
      }`}
    >
      {/* Background radial glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-10 pointer-events-none blur-[140px]"
        style={{
          background: `radial-gradient(circle, #ff5b00 0%, transparent 70%)`,
        }}
      />

      <div className="container-width relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className={`inline-flex items-center gap-2 border text-xs font-semibold px-4 py-1.5 rounded-full mb-3 backdrop-blur-md transition-colors ${
            isDark
              ? 'bg-orange-500/10 border-orange-500/25 text-orange-400'
              : 'bg-orange-50 border-orange-200 text-orange-600'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Smart Used Car Financing Engine</span>
          </div>

          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-3 leading-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Smart Used Car <span className="text-gradient">EMI Calculator</span>
          </h2>
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
            Calculate precise monthly installments, down payment breakdown, and explore flexible loan options with zero foreclosure charges.
          </p>
        </div>

        {/* Main Grid: Left Controls (7 cols) + Right Analytics Output (5 cols) */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* LEFT: SLIDERS & CONTROLS */}
          <div
            className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border shadow-xl relative transition-all ${
              isDark ? 'bg-[#101117] border-white/10' : 'bg-white border-gray-200 shadow-gray-200/50'
            }`}
          >
            {/* Quick Inventory Auto-Select */}
            <div className="mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                  Auto-fill From Our Certified Inventory
                </label>
                <span className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                  Optional quick pick
                </span>
              </div>
              <div className="relative">
                <select
                  value={selectedInventoryCarId}
                  onChange={(e) => handleCarSelect(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-xs font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                    isDark ? 'bg-[#181920] border-white/15 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                  }`}
                >
                  <option value="">Select a car from inventory (e.g. Fortuner, Creta, Porsche...)</option>
                  {allCars.map((car) => (
                    <option key={car.id} value={car.id} className={isDark ? 'bg-[#181920] text-white' : 'bg-white text-gray-900'}>
                      {car.brand} {car.model} ({car.year}) — {formatINR(car.price)}
                    </option>
                  ))}
                </select>
                <CarIcon className={`w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? 'text-white/40' : 'text-gray-400'
                }`} />
              </div>
            </div>

            <div className="space-y-6">
              {/* 1. Car Price */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Used Car Price
                  </span>
                  <div className="flex items-center gap-1 font-mono font-bold text-base sm:text-lg text-orange-500">
                    <span>{formatINR(carPrice)}</span>
                  </div>
                </div>

                <input
                  type="range"
                  min={200000}
                  max={30000000}
                  step={50000}
                  value={carPrice}
                  onChange={(e) => {
                    setCarPrice(Number(e.target.value));
                    setSelectedInventoryCarId('');
                  }}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                {/* Quick Price Preset Pills */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {[600000, 1000000, 1800000, 3500000, 10000000].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setCarPrice(p);
                        setSelectedInventoryCarId('');
                      }}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        carPrice === p
                          ? 'bg-orange-500 text-white border-orange-500 font-bold'
                          : isDark
                          ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {formatINR(p)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Down Payment */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                      Down Payment ({downPaymentPercent}%)
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-500">
                    {formatINR(calculations.downPaymentAmount)}
                  </span>
                </div>

                <input
                  type="range"
                  min={0}
                  max={80}
                  step={5}
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />

                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {[
                    { pct: 0, label: '0% Down Payment' },
                    { pct: 15, label: '15%' },
                    { pct: 25, label: '25%' },
                    { pct: 40, label: '40%' },
                    { pct: 50, label: '50%' },
                  ].map((item) => (
                    <button
                      key={item.pct}
                      type="button"
                      onClick={() => setDownPaymentPercent(item.pct)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                        downPaymentPercent === item.pct
                          ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                          : isDark
                          ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Loan Tenure */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                    Loan Tenure: {tenureMonths} Months ({tenureMonths / 12} {tenureMonths === 12 ? 'Year' : 'Years'})
                  </span>
                  <span className={`text-xs font-semibold ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Up to 7 Years
                  </span>
                </div>

                <input
                  type="range"
                  min={12}
                  max={84}
                  step={12}
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-2">
                  {[12, 24, 36, 48, 60, 72, 84].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTenureMonths(m)}
                      className={`py-1.5 text-xs font-semibold rounded-lg border text-center transition-all ${
                        tenureMonths === m
                          ? 'bg-orange-500 text-white border-orange-500 font-bold shadow-sm'
                          : isDark
                          ? 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                          : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {m / 12}Y
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Interest Rate */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                      Interest Rate p.a.
                    </span>
                    <span className="text-[10px] bg-blue-500/15 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded font-semibold">
                      {interestRate < 10 ? 'Super Prime' : interestRate < 12.5 ? 'Prime Credit' : 'Standard'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-blue-500">
                    {interestRate.toFixed(2)}% p.a.
                  </span>
                </div>

                <input
                  type="range"
                  min={8.5}
                  max={17.5}
                  step={0.25}
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />

                <div className="flex items-center justify-between text-[11px] mt-1.5 text-gray-400">
                  <span>8.5% (Best Bank Rate)</span>
                  <span>13.0% (Average)</span>
                  <span>17.5% (Flexible Approval)</span>
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setShowEligibilityModal(true)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Check Instant Loan Eligibility</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAmortization(!showAmortization)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>{showAmortization ? 'Hide Repayment Schedule' : 'View Year-by-Year Schedule'}</span>
                {showAmortization ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* RIGHT: ANALYTICS, DONUT CHART & EMI SHOWCASE */}
          <div className="lg:col-span-5 space-y-6">
            {/* Primary Result Highlight Card */}
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden text-center transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-[#14151c] to-[#0f1015] border-orange-500/30 shadow-black/80'
                  : 'bg-gradient-to-b from-orange-50/60 via-white to-orange-50/30 border-orange-200 shadow-xl shadow-orange-500/10'
              }`}
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />

              <span className="text-orange-500 text-xs font-bold uppercase tracking-wider">
                Calculated Monthly Installment
              </span>

              <div className="text-4xl sm:text-5xl font-black text-orange-500 my-2 tracking-tight">
                ₹{calculations.monthlyEmi.toLocaleString('en-IN')}
                <span className={`text-xs sm:text-sm font-semibold ml-1.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  / month
                </span>
              </div>

              <p className={`text-xs mb-6 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                For a loan of <span className="font-bold text-white dark:text-white">{formatINR(calculations.principal)}</span> over {tenureMonths / 12} years
              </p>

              {/* Donut Chart Visual Breakdown */}
              <div className="flex items-center justify-center gap-6 my-4">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                    {/* Background circle */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={isDark ? 'rgba(255,255,255,0.08)' : '#e5e7eb'}
                      strokeWidth="16"
                      fill="transparent"
                    />
                    {/* Principal Segment (Orange) */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#ff5b00"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${principalStroke} ${circumference}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                    {/* Interest Segment (Blue) */}
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke="#3b82f6"
                      strokeWidth="16"
                      fill="transparent"
                      strokeDasharray={`${interestStroke} ${circumference}`}
                      strokeDashoffset={-principalStroke}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-xs font-black text-orange-500">
                      {calculations.principalPercent}%
                    </span>
                    <span className={`text-[10px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
                      Principal
                    </span>
                  </div>
                </div>

                {/* Legend & Breakdown */}
                <div className="text-left space-y-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                      <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Principal Loan:</span>
                    </div>
                    <span className="font-mono font-bold text-sm block pl-4">
                      {formatINR(calculations.principal)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Total Interest:</span>
                    </div>
                    <span className="font-mono font-bold text-sm block pl-4 text-blue-400">
                      {formatINR(calculations.totalInterest)}
                    </span>
                  </div>

                  <div className="pt-1 border-t border-white/10">
                    <span className={`text-[11px] block ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Total Payable:</span>
                    <span className="font-mono font-black text-sm block">
                      {formatINR(calculations.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Smart Affordability Advisor Box */}
              <div className={`mt-5 p-3.5 rounded-2xl border text-left flex items-start gap-3 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
              }`}>
                <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed">
                  <span className="font-bold text-emerald-400">Affordability Insight: </span>
                  <span className={isDark ? 'text-white/70' : 'text-gray-600'}>
                    A monthly net salary of <strong>₹{calculations.recommendedSalary.toLocaleString('en-IN')}+</strong> keeps your vehicle EMI comfortably below the recommended 40% income threshold.
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onBookTestDrive?.()}
                  className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25"
                >
                  <CarIcon className="w-4 h-4" />
                  <span>Book Free Test Drive With This EMI</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Bank Partners Showcase Card */}
            <div className={`p-5 rounded-3xl border ${isDark ? 'bg-[#101117] border-white/10' : 'bg-white border-gray-200 shadow-md'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Instant Approval Bank Partners
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 font-bold px-2 py-0.5 rounded-full">
                  100% Paperless
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BANK_PARTNERS.map((b) => (
                  <div
                    key={b.name}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isDark ? 'bg-white/5 border-white/8 hover:border-white/20' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-bold text-xs truncate">{b.name}</p>
                    <p className="text-[11px] text-orange-500 font-semibold">{b.rate}</p>
                    <p className={`text-[9px] mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{b.badge}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* YEAR-BY-YEAR AMORTIZATION SCHEDULE ACCORDION */}
        <AnimatePresence>
          {showAmortization && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="mt-10 overflow-hidden"
            >
              <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl ${
                isDark ? 'bg-[#101117] border-white/10' : 'bg-white border-gray-200 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
                  <div>
                    <h3 className="font-bold text-lg sm:text-xl">Year-by-Year Repayment Amortization Schedule</h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                      See how much goes into principal reduction versus interest each year
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAmortization(false)}
                    className="text-xs text-orange-500 font-semibold hover:underline"
                  >
                    Close Table
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-white/10 text-white/60' : 'border-gray-200 text-gray-500'}`}>
                        <th className="py-3 px-4 font-bold">Year</th>
                        <th className="py-3 px-4 font-bold">Principal Paid</th>
                        <th className="py-3 px-4 font-bold">Interest Paid</th>
                        <th className="py-3 px-4 font-bold">Total Annual Installment</th>
                        <th className="py-3 px-4 font-bold">Ending Outstanding Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.yearlySchedule.map((row) => (
                        <tr
                          key={row.year}
                          className={`border-b transition-colors ${
                            isDark ? 'border-white/5 hover:bg-white/5' : 'border-gray-100 hover:bg-gray-50'
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-orange-500">Year {row.year}</td>
                          <td className="py-3 px-4 font-mono font-semibold">{formatINR(row.principalPaid)}</td>
                          <td className="py-3 px-4 font-mono text-blue-400">{formatINR(row.interestPaid)}</td>
                          <td className="py-3 px-4 font-mono font-bold">{formatINR(row.principalPaid + row.interestPaid)}</td>
                          <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{formatINR(row.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QUICK PRE-APPROVAL ELIGIBILITY MODAL */}
        <AnimatePresence>
          {showEligibilityModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowEligibilityModal(false)}
                className="fixed inset-0 bg-black/75 backdrop-blur-md"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 border shadow-2xl z-10 ${
                  isDark ? 'bg-[#121319] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Instant Loan Eligibility</h3>
                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Zero CIBIL score impact check</p>
                  </div>
                </div>

                <div className="space-y-4 my-5">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1.5 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                      Your Monthly Net Salary / Income
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-orange-500">₹</span>
                      <input
                        type="text"
                        value={eligibilityIncome}
                        onChange={(e) => setEligibilityIncome(e.target.value.replace(/[^0-9]/g, ''))}
                        className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          isDark ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-gray-200 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border text-center ${
                    isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <span className="text-[11px] font-bold uppercase text-emerald-500">
                      Estimated Pre-Approved Loan Limit
                    </span>
                    <div className="text-3xl font-black text-emerald-500 mt-1">
                      {formatINR(eligibleLoanLimit)}
                    </div>
                    <p className={`text-[11px] mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Based on 45% debt-to-income ratio at {interestRate}% for 5 years
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowEligibilityModal(false)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-sm transition-all"
                  >
                    Got It, Apply To Calculator
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
