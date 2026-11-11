import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Fuel,
  Gauge,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { featuredCars } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';
import SteeringWheelIcon from './SteeringWheelIcon';
import type { Car } from '../types';

const formatPrice = (p: number) =>
  p >= 10000000
    ? `₹${(p / 10000000).toFixed(2)} Cr`
    : p >= 100000
    ? `₹${(p / 100000).toFixed(2)} Lakh`
    : `₹${p.toLocaleString('en-IN')}`;

interface HeroCarouselProps {
  onBookTestDrive?: (car?: Car) => void;
}

export default function HeroCarousel({ onBookTestDrive }: HeroCarouselProps = {}) {
  const { theme } = useTheme();
  const [activeIdx, setActiveIdx] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  const total = featuredCars.length;
  const activeCar = featuredCars[activeIdx];
  const isDark = theme === 'dark';

  // Smooth auto-slide every 5 seconds if not paused
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % total);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoPlay, total]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setActiveIdx((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setActiveIdx((prev) => (prev + 1) % total);
  };

  const handleSelectCar = (index: number) => {
    setIsAutoPlay(false);
    setActiveIdx(index);
  };

  return (
    <section
      className={`relative pt-24 md:pt-28 pb-12 overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#070709] text-white' : 'bg-gradient-to-b from-slate-50 via-gray-50 to-white text-gray-900'
      }`}
    >
      {/* Ambient Backdrop Glow tuned to car paint color */}
      <motion.div
        key={activeCar.id}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: isDark ? 0.55 : 0.22, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] rounded-full blur-[140px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${activeCar.color || '#ff5b00'} 0%, rgba(255,91,0,0.18) 45%, transparent 75%)`,
        }}
      />

      {/* Subtle Studio Grid Overlay */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? 'opacity-[0.035]' : 'opacity-[0.025]'
        }`}
        style={{
          backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
                            linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
          backgroundSize: '72px 72px',
        }}
      />

      <div className="container-width relative z-10">
        {/* 1. Header: Big Headline */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              Find the car <span className="text-gradient">everyone deserves</span>
            </h1>

            <p
              className={`text-sm sm:text-base max-w-2xl mx-auto mt-3 ${
                isDark ? 'text-white/60' : 'text-gray-600'
              }`}
            >
              Explore handpicked certified pre-owned luxury sedans, performance coupes, and rugged SUVs with transparent pricing and doorstep delivery.
            </p>
          </motion.div>
        </div>

        {/* 2. Main Hero Car Showcase (Clean, high-impact presentation) */}
        <div
          className={`relative rounded-3xl border overflow-hidden shadow-2xl transition-all ${
            isDark
              ? 'bg-gradient-to-b from-[#111218]/90 via-[#0c0d12]/95 to-[#08080b] border-white/10 shadow-black/80'
              : 'bg-white border-gray-200/80 shadow-2xl shadow-gray-200/60'
          }`}
        >
          {/* Top Info Bar inside Showcase */}
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {activeCar.badge || 'Featured Vehicle'}
              </span>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                {activeCar.year} Model • {activeCar.brand}
              </span>
            </div>

            {/* Navigation Arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                aria-label="Previous Car"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isDark
                    ? 'border-white/10 bg-white/5 hover:bg-orange-500 hover:border-orange-500 text-white'
                    : 'border-gray-200 bg-gray-50 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-gray-700'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className={`text-xs font-semibold px-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {activeIdx + 1} / {total}
              </span>

              <button
                onClick={handleNext}
                aria-label="Next Car"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  isDark
                    ? 'border-white/10 bg-white/5 hover:bg-orange-500 hover:border-orange-500 text-white'
                    : 'border-gray-200 bg-gray-50 hover:bg-orange-500 hover:text-white hover:border-orange-500 text-gray-700'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Car Spotlight Canvas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 lg:p-10 items-center">
            {/* Left: Car Title, Specs & CTAs (5 columns on large screen) */}
            <div className="lg:col-span-5 flex flex-col justify-center order-2 lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCar.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-orange-500 text-xs font-black uppercase tracking-wider mb-1">
                    {activeCar.brand}
                  </p>
                  <h2 className={`text-2xl sm:text-3xl md:text-4xl font-black mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activeCar.model}
                  </h2>

                  {/* Price & EMI */}
                  <div className="mb-5 pb-5 border-b border-white/10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl sm:text-3xl font-black text-orange-500">
                        {formatPrice(activeCar.price)}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        (Ex-showroom)
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                      Estimated EMI: <span className="font-bold text-orange-400">₹{activeCar.emi.toLocaleString('en-IN')}/mo</span>
                    </p>
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        <span>Kilometers</span>
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activeCar.km.toLocaleString('en-IN')} km
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-1">
                        <Fuel className="w-3.5 h-3.5" />
                        <span>Fuel Type</span>
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activeCar.fuel}
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Transmission</span>
                      </div>
                      <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activeCar.transmission}
                      </p>
                    </div>

                    <div className={`p-3 rounded-xl border ${isDark ? 'bg-white/5 border-white/8' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex items-center gap-1.5 text-xs text-orange-500 font-semibold mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Condition</span>
                      </div>
                      <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Mint Condition
                      </p>
                    </div>
                  </div>

                  {/* CTAs with SteeringWheel driving handle icon */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                      onClick={() => onBookTestDrive?.(activeCar)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-5 py-3 rounded-xl text-sm transition-all shadow-lg shadow-orange-500/30 cursor-pointer"
                    >
                      <SteeringWheelIcon className="w-4 h-4" />
                      <span>Book Test Drive</span>
                    </motion.button>

                    <motion.a
                      href="#popular-cars"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-3 rounded-xl text-sm transition-all shadow-md"
                    >
                      <span>Explore Cars</span>
                      <ArrowRight className="w-4 h-4" />
                    </motion.a>

                    <motion.a
                      href="#sell-car"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`flex items-center gap-1.5 border font-semibold px-4 py-3 rounded-xl text-sm transition-all ${
                        isDark
                          ? 'border-white/15 bg-white/5 hover:bg-white/10 text-white'
                          : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      <span>Sell Car</span>
                    </motion.a>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right: Big Hero Car Photo Showcase (7 columns on large screen) */}
            <div className="lg:col-span-7 relative order-1 lg:order-2 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCar.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.4 }}
                  className="relative w-full max-w-xl mx-auto"
                >
                  {/* Photo Container */}
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[16/10] bg-black/40">
                    <img
                      src={activeCar.image}
                      alt={`${activeCar.brand} ${activeCar.model}`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />

                    {/* Gradient Overlay for Cinematic Contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                    {/* Bottom Car Tag Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white pointer-events-none">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-orange-400 font-bold">
                          {activeCar.badge}
                        </p>
                        <h3 className="font-extrabold text-lg sm:text-xl drop-shadow-md">
                          {activeCar.brand} {activeCar.model}
                        </h3>
                      </div>
                      <span className="text-xs bg-black/60 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full font-semibold">
                        {activeCar.year}
                      </span>
                    </div>
                  </div>

                  {/* Soft Ground Reflection Shadow */}
                  <div
                    className="w-4/5 h-6 mx-auto rounded-full blur-xl -mt-2 pointer-events-none"
                    style={{
                      background: activeCar.color
                        ? `radial-gradient(ellipse, ${activeCar.color} 0%, transparent 80%)`
                        : 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 80%)',
                    }}
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Interactive Car Selector Tabs */}
          <div className={`p-4 sm:p-5 border-t ${isDark ? 'bg-black/40 border-white/5' : 'bg-gray-50/80 border-gray-100'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-3 text-center sm:text-left ${
              isDark ? 'text-white/40' : 'text-gray-400'
            }`}>
              Quick Switch Featured Cars:
            </p>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {featuredCars.map((car, idx) => {
                const isSelected = idx === activeIdx;
                return (
                  <button
                    key={car.id}
                    onClick={() => handleSelectCar(idx)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30 scale-[1.02]'
                        : isDark
                        ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/5'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: isSelected ? '#ffffff' : car.color || '#ff5b00' }} />
                    <span>{car.brand} {car.model}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                      isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {formatPrice(car.price)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Value Proposition Strip (Clean, customer-focused, NO quality check / 200-point inspection!) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-white/5 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
              <SteeringWheelIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">Doorstep Test Drive</p>
              <p className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>At home or office</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-white/5 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">5-Day Full Refund</p>
              <p className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Zero questions asked</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-white/5 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">1-Year Warranty</p>
              <p className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>Engine & transmission</p>
            </div>
          </div>

          <div className={`p-4 rounded-2xl border flex items-center gap-3 ${
            isDark ? 'bg-white/5 border-white/8 text-white' : 'bg-white border-gray-200 text-gray-900 shadow-sm'
          }`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm">Fast Doorstep Delivery</p>
              <p className={`text-[11px] ${isDark ? 'text-white/45' : 'text-gray-500'}`}>In 25+ cities across India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
