import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ArrowUpDown,
  Car as CarIcon,
  Fuel,
  Gauge,
  SlidersHorizontal,
  X,
  MessageSquare,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { getAllInventoryCars } from '../services/adminService';
import SteeringWheelIcon from './SteeringWheelIcon';
import type { Car } from '../types';

interface CarLibraryProps {
  onBookTestDrive?: (car: Car) => void;
}

type SortOption = 'price-low-high' | 'price-high-low' | 'year-new' | 'km-low';

const PRICE_PRESETS = [
  { id: 'all', label: 'All Budgets', min: 0, max: Infinity },
  { id: 'under-15', label: 'Under ₹15 Lakh', min: 0, max: 1500000 },
  { id: '15-30', label: '₹15L – ₹30 Lakh', min: 1500000, max: 3000000 },
  { id: '30-75', label: '₹30L – ₹75 Lakh', min: 3000000, max: 7500000 },
  { id: 'above-75', label: 'Above ₹75 Lakh', min: 7500000, max: Infinity },
];

function formatPriceINR(val: number): string {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} Lakh`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function CarLibrary({ onBookTestDrive }: CarLibraryProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { city } = useLocation();

  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedBodyType, setSelectedBodyType] = useState('All');
  const [selectedFuel, setSelectedFuel] = useState('All');
  const [selectedTransmission, setSelectedTransmission] = useState('All');
  const [pricePreset, setPricePreset] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('price-low-high');

  // Mobile filter drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Load cars on mount
  useEffect(() => {
    getAllInventoryCars().then((res) => {
      setCars(res);
      setLoading(false);
    });
  }, []);

  // Compute distinct brands from current inventory
  const availableBrands = useMemo(() => {
    const set = new Set<string>();
    cars.forEach((c) => set.add(c.brand));
    return ['All', ...Array.from(set).sort()];
  }, [cars]);

  // Compute distinct body types
  const availableBodyTypes = ['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Coupe'];
  const availableFuels = ['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid'];

  // Filter & Sort logic
  const filteredCars = useMemo(() => {
    let result = [...cars];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.brand.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          `${c.brand} ${c.model}`.toLowerCase().includes(q)
      );
    }

    // Brand filter
    if (selectedBrand !== 'All') {
      result = result.filter((c) => c.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    // Body Type filter
    if (selectedBodyType !== 'All') {
      result = result.filter((c) => c.bodyType?.toLowerCase() === selectedBodyType.toLowerCase());
    }

    // Fuel filter
    if (selectedFuel !== 'All') {
      result = result.filter((c) => c.fuel?.toLowerCase() === selectedFuel.toLowerCase());
    }

    // Transmission filter
    if (selectedTransmission !== 'All') {
      result = result.filter((c) =>
        c.transmission.toLowerCase().includes(selectedTransmission.toLowerCase())
      );
    }

    // Price preset
    const preset = PRICE_PRESETS.find((p) => p.id === pricePreset);
    if (preset && preset.id !== 'all') {
      result = result.filter((c) => c.price >= preset.min && c.price <= preset.max);
    }

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'year-new':
          return b.year - a.year;
        case 'km-low':
          return a.km - b.km;
        default:
          return 0;
      }
    });

    return result;
  }, [cars, searchQuery, selectedBrand, selectedBodyType, selectedFuel, selectedTransmission, pricePreset, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedBrand('All');
    setSelectedBodyType('All');
    setSelectedFuel('All');
    setSelectedTransmission('All');
    setPricePreset('all');
    setSortBy('price-low-high');
  };

  const activeFilterCount =
    (selectedBrand !== 'All' ? 1 : 0) +
    (selectedBodyType !== 'All' ? 1 : 0) +
    (selectedFuel !== 'All' ? 1 : 0) +
    (selectedTransmission !== 'All' ? 1 : 0) +
    (pricePreset !== 'all' ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  return (
    <section
      id="car-library"
      className={`section-padding border-t transition-colors duration-500 ${
        isDark ? 'bg-[#08080c] border-white/8 text-white' : 'bg-slate-50 border-gray-200 text-gray-900'
      }`}
    >
      <div className="container-width">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-orange-500/15 text-orange-500 border border-orange-500/25">
                Complete Catalog
              </span>
              <span className="text-xs font-semibold text-gray-400">
                {city} & Nationwide Delivery
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
              Car Library & <span className="text-gradient">Certified Inventory</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-xl">
              Filter by maker brand, sort high-to-low or low-to-high, and inspect verified specifications with instant test drive booking.
            </p>
          </div>

          {/* Quick Active Results Counter */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400">
              Showing <span className="text-orange-500 font-extrabold">{filteredCars.length}</span> of {cars.length} cars
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs font-bold text-orange-500 hover:text-orange-400 underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset ({activeFilterCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* ================= CONTROLS TOOLBAR ================= */}
        <div
          className={`p-4 sm:p-5 rounded-2xl border mb-8 shadow-sm backdrop-blur-md ${
            isDark ? 'bg-[#101117] border-white/10' : 'bg-white border-gray-200'
          }`}
        >
          {/* Row 1: Search + Brand Select + Price Sort Dropdown + Mobile Filter Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Creta, 911, Fortuner..."
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium outline-none transition-all ${
                  isDark
                    ? 'bg-white/5 border-white/15 focus:border-orange-500 text-white placeholder:text-white/30'
                    : 'bg-gray-50 border-gray-200 focus:border-orange-500 text-gray-900'
                }`}
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Select Brand Dropdown */}
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold outline-none transition-all cursor-pointer appearance-none ${
                  isDark
                    ? 'bg-[#15161e] border-white/15 focus:border-orange-500 text-white'
                    : 'bg-gray-50 border-gray-200 focus:border-orange-500 text-gray-900'
                }`}
              >
                <option value="All">All Brands (Makers)</option>
                {availableBrands.filter((b) => b !== 'All').map((b) => (
                  <option key={b} value={b} className={isDark ? 'bg-[#15161e]' : ''}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Price Sort: High to Low / Low to High (Explicit User Requirement) */}
            <div className="relative">
              <div className="flex items-center gap-1.5 absolute left-3 top-2.5 pointer-events-none text-orange-500">
                <ArrowUpDown className="w-4 h-4" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-xs sm:text-sm font-bold outline-none transition-all cursor-pointer appearance-none ${
                  isDark
                    ? 'bg-[#15161e] border-white/15 focus:border-orange-500 text-orange-400'
                    : 'bg-gray-50 border-gray-200 focus:border-orange-500 text-orange-600'
                }`}
              >
                <option value="price-low-high">Price: Low to High (₹ Lowest First)</option>
                <option value="price-high-low">Price: High to Low (₹ Highest First)</option>
                <option value="year-new">Year: Newest First</option>
                <option value="km-low">KM: Lowest Mileage First</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
            </div>

            {/* Mobile Filter Trigger & Quick Presets */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  mobileFilterOpen || activeFilterCount > 0
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : isDark
                    ? 'bg-white/5 border-white/15 hover:bg-white/10 text-white'
                    : 'bg-gray-100 border-gray-200 text-gray-800'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
              </button>

              {activeFilterCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  title="Clear all filters"
                  className="p-2.5 rounded-xl border border-white/15 text-gray-400 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Brand Quick-Scroll Strip (Mobile Touch Friendly) */}
          <div className="mt-4 pt-3 border-t border-white/8 overflow-x-auto no-scrollbar flex items-center gap-2 pb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex-shrink-0 mr-1">
              Brand:
            </span>
            {availableBrands.map((brand) => {
              const active = selectedBrand.toLowerCase() === brand.toLowerCase();
              return (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex-shrink-0 cursor-pointer ${
                    active
                      ? 'bg-orange-500 text-white shadow-sm'
                      : isDark
                      ? 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                      : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {brand}
                </button>
              );
            })}
          </div>

          {/* Collapsible / Expandable Extra Filters (Fuel, Body Type, Transmission, Budget) */}
          <AnimatePresence>
            {mobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-4 mt-4 border-t border-white/10 space-y-4"
              >
                {/* Budget Presets */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">
                    Budget Range
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRICE_PRESETS.map((p) => {
                      const active = pricePreset === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setPricePreset(p.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            active
                              ? 'bg-emerald-500 text-white shadow-sm'
                              : isDark
                              ? 'bg-white/5 border border-white/10 text-white/70 hover:text-white'
                              : 'bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Body Type & Fuel & Transmission Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Body Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Body Style
                    </label>
                    <select
                      value={selectedBodyType}
                      onChange={(e) => setSelectedBodyType(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-[#15161e] border-white/15 text-white' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {availableBodyTypes.map((t) => (
                        <option key={t} value={t} className={isDark ? 'bg-[#15161e]' : ''}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fuel Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Fuel Type
                    </label>
                    <select
                      value={selectedFuel}
                      onChange={(e) => setSelectedFuel(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-[#15161e] border-white/15 text-white' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      {availableFuels.map((f) => (
                        <option key={f} value={f} className={isDark ? 'bg-[#15161e]' : ''}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Transmission */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
                      Transmission
                    </label>
                    <select
                      value={selectedTransmission}
                      onChange={(e) => setSelectedTransmission(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
                        isDark ? 'bg-[#15161e] border-white/15 text-white' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <option value="All">All Transmissions</option>
                      <option value="Automatic">Automatic (AT / DCT / PDK)</option>
                      <option value="Manual">Manual</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ================= CARS GRID ================= */}
        {loading ? (
          <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-sm font-semibold">Loading certified car inventory...</p>
          </div>
        ) : filteredCars.length === 0 ? (
          <div
            className={`p-12 text-center rounded-3xl border ${
              isDark ? 'bg-[#101117] border-white/10' : 'bg-white border-gray-200'
            }`}
          >
            <CarIcon className="w-12 h-12 text-orange-500 mx-auto mb-3 opacity-60" />
            <h3 className="text-lg font-bold">No cars match your selected filters</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
              Try switching your brand, adjusting the price sort, or clearing active filters to see all available vehicles.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl font-bold text-xs bg-orange-500 text-white shadow-md shadow-orange-500/20"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: (index % 6) * 0.05 }}
                className={`rounded-3xl overflow-hidden border transition-all duration-300 group flex flex-col ${
                  isDark
                    ? 'bg-[#101117] border-white/10 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/10'
                    : 'bg-white border-gray-200 hover:border-orange-500/50 hover:shadow-xl shadow-gray-200/50'
                }`}
              >
                {/* Image Cover */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-black/40">
                  <img
                    src={car.image}
                    alt={`${car.brand} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                    loading="lazy"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-500 text-white shadow-md">
                      {car.badge || 'Verified Stock'}
                    </span>
                  </div>

                  {/* Year Tag */}
                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                      {car.year} Model
                    </span>
                  </div>

                  {/* Bottom Image Info: Price Highlight */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
                    <div>
                      <span className="text-[11px] text-white/70 block font-medium">Offered Price</span>
                      <span className="text-xl sm:text-2xl font-black text-white">
                        {formatPriceINR(car.price)}
                      </span>
                    </div>
                    {car.emi && (
                      <div className="text-right">
                        <span className="text-[10px] text-white/70 block">Starts at</span>
                        <span className="text-xs font-bold text-amber-300">
                          ₹{car.emi.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Car Details Content */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Brand & Model Name */}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-orange-500">
                        {car.brand}
                      </span>
                      <span className="text-[11px] text-gray-400 font-semibold">
                        {car.bodyType || 'SUV'}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold line-clamp-1 mb-3">
                      {car.brand} {car.model}
                    </h3>

                    {/* Spec Chips (Fuel, Transmission, KM) */}
                    <div className="grid grid-cols-3 gap-2 pb-3 mb-4 border-b border-white/8 text-center">
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <Fuel className="w-3.5 h-3.5 text-orange-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold block truncate">{car.fuel}</span>
                      </div>
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <Gauge className="w-3.5 h-3.5 text-blue-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold block truncate">{car.km.toLocaleString('en-IN')} km</span>
                      </div>
                      <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <CarIcon className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
                        <span className="text-[11px] font-bold block truncate">{car.transmission}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions: Book Test Drive + WhatsApp */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => onBookTestDrive?.(car)}
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 transition-all"
                    >
                      <SteeringWheelIcon className="w-4 h-4" />
                      <span>Book Test Drive</span>
                    </button>

                    <a
                      href={`https://wa.me/919999999999?text=Hello%20BetterCars!%20I%20am%20interested%20in%20the%20${encodeURIComponent(
                        `${car.year} ${car.brand} ${car.model}`
                      )}%20priced%20at%20${encodeURIComponent(formatPriceINR(car.price))}.`}
                      target="_blank"
                      rel="noreferrer"
                      title="Enquire on WhatsApp"
                      className={`p-2.5 rounded-xl border transition-all ${
                        isDark
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
